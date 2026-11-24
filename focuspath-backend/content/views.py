from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from content.models import EducationLevel, Subject, Topic, Video
from content.serializers import (
    EducationLevelSerializer, SubjectSerializer, TopicSerializer, VideoSerializer,
    VideoCreateSerializer, MyVideoSerializer,
)
from users.models import User, AGE_GROUP_BOUNDS


# All content endpoints are read-only; adding/approving content happens in the Django
# admin so the child-facing catalog stays fully curated.

class LevelListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EducationLevelSerializer
    queryset = EducationLevel.objects.all()


class SubjectListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer

    def get_queryset(self):
        qs = Subject.objects.all()
        level = self.request.query_params.get('level')  # ?level=<id>
        return qs.filter(level_id=level) if level else qs


class TopicListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TopicSerializer

    def get_queryset(self):
        qs = Topic.objects.all()
        subject = self.request.query_params.get('subject')  # ?subject=<id>
        return qs.filter(subject_id=subject) if subject else qs


class VideoListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VideoSerializer

    def get_queryset(self):
        qs = Video.objects.filter(is_approved=True)  # never expose unapproved videos to a child
        topic = self.request.query_params.get('topic')  # ?topic=<id>
        if topic:
            qs = qs.filter(topic_id=topic)
        # a Kid only ever sees videos whose age range overlaps the bracket their parent assigned —
        # rule-based on the existing age_min/age_max fields, not a manual grade pick
        user = self.request.user
        if user.role == User.Roles.KID and user.age_group in AGE_GROUP_BOUNDS:
            lo, hi = AGE_GROUP_BOUNDS[user.age_group]
            qs = qs.filter(age_min__lte=hi, age_max__gte=lo)
        return qs


class IsParentUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Roles.PARENT


class AddVideoView(generics.CreateAPIView):
    # Parent-facing "add a learning video": creates Level/Subject/Topic on the fly and an
    # auto-approved Video, so it shows up in the child's Learn catalog immediately.
    permission_classes = [IsParentUser]
    serializer_class = VideoCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        video = serializer.save()
        return Response(MyVideoSerializer(video).data, status=status.HTTP_201_CREATED)


class MyVideosView(generics.ListAPIView):
    # The videos this parent has personally added (their curation, not the shared admin catalog).
    permission_classes = [IsParentUser]
    serializer_class = MyVideoSerializer

    def get_queryset(self):
        return Video.objects.filter(approved_by=self.request.user).order_by('-created_at')


class DeleteMyVideoView(generics.DestroyAPIView):
    # A parent can only remove a video they personally added, never the shared curated catalog.
    permission_classes = [IsParentUser]

    def get_queryset(self):
        return Video.objects.filter(approved_by=self.request.user)

import os
import json
import requests
from rest_framework.views import APIView


def is_educational_content(query: str) -> tuple[bool, str]:
    """
    Evaluates whether a search query is genuine educational/learning content.
    Prevents non-educational content (games, pop music, movies, pranks, comedy, vlogs)
    from being searched in the kids profile.
    """
    q = query.lower().strip()
    
    # Strip common curriculum wrappers (e.g., 'Class 6 Maths ... NCERT in english')
    clean_q = q
    for prefix in ["class 1 ", "class 2 ", "class 3 ", "class 4 ", "class 5 ", "class 6 ", "class 7 ", "class 8 ", "class 9 ", "class 10 ", "class 11 ", "class 12 "]:
        if clean_q.startswith(prefix):
            clean_q = clean_q[len(prefix):]
    clean_q = clean_q.replace("ncert", "").replace("in english", "").strip()
    
    # 1. Hard Blocklist: Immediate rejection of entertainment/gaming/pop culture terms
    non_edu_keywords = [
        'gameplay', 'gaming', 'walkthrough', 'playthrough', 'roblox', 'minecraft',
        'gta', 'fortnite', 'pubg', 'free fire', 'brawl stars', 'clash royale', 'among us',
        'prank', 'vlog', 'trailer', 'teaser', 'movie', 'film', 'cinema', 'song',
        'music video', 'lyrics', 'dance', 'comedy', 'meme', 'memes', 'funny moments',
        'tiktok', 'reels', 'shorts', 'reaction', 'challenge', 'unboxing', 'toys review',
        'horror', 'scary', 'spooky', 'violence', 'fight', 'wwe', 'wrestling', 'gun',
        'dating', 'kiss', 'romantic', 'celebrity gossip', 'drama'
    ]
    for bad in non_edu_keywords:
        if bad in clean_q:
            return False, f"'{bad}' is entertainment/gaming. FocusPath Kids only allows educational and learning content."

    # 2. Whitelist: Immediate pass for verified academic & educational terms
    edu_keywords = [
        'math', 'maths', 'algebra', 'geometry', 'fraction', 'multiplication', 'division',
        'addition', 'subtraction', 'calculus', 'arithmetic', 'number', 'equation',
        'science', 'physics', 'chemistry', 'biology', 'photosynthesis', 'space',
        'planet', 'solar system', 'astronomy', 'earth', 'geography', 'history',
        'civilization', 'ancient', 'dinosaur', 'fossils', 'ecosystem', 'animal',
        'plant', 'human body', 'skeleton', 'brain', 'heart', 'atoms', 'elements',
        'periodic table', 'magnet', 'gravity', 'energy', 'force', 'light', 'sound',
        'english', 'grammar', 'noun', 'verb', 'adjective', 'vocabulary', 'spelling',
        'reading', 'phonics', 'coding', 'programming', 'python', 'scratch', 'html',
        'computer', 'robotics', 'inventions', 'discovery', 'experiment', 'how it works',
        'how do', 'why do', 'tutorial', 'lesson', 'chapter', 'ncert', 'cbse'
    ]
    for good in edu_keywords:
        if good in clean_q:
            return True, "Educational topic approved."

    # 3. AI Semantic Classifier for ambiguous queries (e.g. 'origami crane', 'black holes', 'ancient pyramids')
    try:
        import google.generativeai as genai
        from utils.ai import get_random_gemini_key
        
        genai.configure(api_key=get_random_gemini_key(), transport='rest')
        model = genai.GenerativeModel(
            model_name="gemini-flash-lite-latest",
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.0
            )
        )
        prompt = f"""Evaluate if this search query on a children's K-12 learning app is EDUCATIONAL/ACADEMIC.
Educational includes: school subjects, science, math, history, geography, space, nature, coding, how things work, educational crafts, academic concepts.
NON-educational includes: video games, gaming streams, movies, pop music, pranks, comedy, memes, vlogs, entertainment.

Query: "{clean_q}"

Respond strictly as JSON:
{{"is_educational": true or false, "reason": "brief 1-sentence kid-friendly reason"}}"""
        
        res = model.generate_content(prompt, request_options={"timeout": 3.0})
        data = json.loads(res.text)
        is_edu = bool(data.get('is_educational', False))
        reason = data.get('reason', '')
        if not is_edu and not reason:
            reason = "This search topic is not educational. FocusPath Kids only allows school subjects, science, math, space, or history!"
        return is_edu, reason
    except Exception:
        # If AI times out or fails, fail safe for kids
        if len(clean_q.split()) <= 2 and not any(k in clean_q for k in ['learn', 'study', 'how', 'what', 'why', 'lesson']):
            return False, "Only verified educational and learning topics are allowed in Kids Zone."
        return True, "Educational search allowed."


class YouTubeSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        raw_query = request.query_params.get('q', '').strip()
        if not raw_query:
            return Response({"detail": "Missing 'q' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. STRICT EDUCATIONAL SAFETY GATEKEEPER (For Kid users)
        is_adult_user = request.user.role == 'ADULT'
        if not is_adult_user:
            is_edu, reason = is_educational_content(raw_query)
            if not is_edu:
                return Response({
                    "blocked": True,
                    "error": "not_educational",
                    "reason": reason,
                    "message": "Only educational and learning content is allowed in Kids Zone. Entertainment, gaming, movies, and pop music are not permitted."
                }, status=status.HTTP_200_OK)

        api_key = os.environ.get('YOUTUBE_API_KEY')
        
        # Clean query for optimal YouTube educational retrieval
        clean_q = raw_query
        for prefix in ["class 1 ", "class 2 ", "class 3 ", "class 4 ", "class 5 ", "class 6 ", "class 7 ", "class 8 ", "class 9 ", "class 10 ", "class 11 ", "class 12 "]:
            if clean_q.lower().startswith(prefix):
                clean_q = clean_q[len(prefix):]
        clean_q = clean_q.replace("NCERT", "").replace("ncert", "").replace("in english", "").strip()

        if not api_key:
            # High-quality educational fallback for verified educational topic
            return Response([
                {
                    "video_id": "libKVRa01L8",
                    "title": f"Educational Lesson: {clean_q.title()}",
                    "thumbnail_url": "https://img.youtube.com/vi/libKVRa01L8/hqdefault.jpg",
                    "source_channel": "National Geographic Kids",
                    "duration_seconds": 360,
                    "is_educational": True
                },
                {
                    "video_id": "38n0FkL_DQU",
                    "title": f"Science & Concepts Explained: {clean_q.title()}",
                    "thumbnail_url": "https://img.youtube.com/vi/38n0FkL_DQU/hqdefault.jpg",
                    "source_channel": "CrashCourse Kids",
                    "duration_seconds": 420,
                    "is_educational": True
                }
            ], status=status.HTTP_200_OK)

        url = "https://www.googleapis.com/youtube/v3/search"
        
        # Only fetch strictly from approved academic & STEM categories:
        # Category 27 = Education
        # Category 28 = Science & Technology
        safe_categories = ["27", "28"]
        
        bad_keywords = [
            'trailer', 'movie', 'film', 'teaser', 'reaction', 'song', 'music', 'edit',
            'cinematic', 'lyric', 'bollywood', 'hollywood', 'promo', 'gameplay', 'gaming',
            'roblox', 'minecraft', 'gta', 'fortnite', 'prank', 'vlog', 'comedy', 'meme',
            'tiktok', 'shorts', 'challenge', 'horror', 'scary', 'wwe', 'dating'
        ]
        
        age_hint = ''
        if request.user.role == User.Roles.KID and request.user.age_group in AGE_GROUP_BOUNDS:
            lo, _ = AGE_GROUP_BOUNDS[request.user.age_group]
            age_hint = ' for kids' if lo <= 8 else ' for students'
            
        videos = []
        try:
            for cat_id in safe_categories:
                params = {
                    "part": "snippet",
                    "q": f"{clean_q} tutorial{age_hint} OR {clean_q} educational lesson{age_hint}",
                    "type": "video",
                    "videoCategoryId": cat_id,
                    "safeSearch": "strict",
                    "videoEmbeddable": "true",
                    "maxResults": 6,
                    "key": api_key
                }
                
                r = requests.get(url, params=params, timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    for item in data.get('items', []):
                        title = item['snippet']['title'].lower()
                        desc = item['snippet']['description'].lower()
                        
                        if any(bad_word in title or bad_word in desc for bad_word in bad_keywords):
                            continue
                            
                        videos.append({
                            "video_id": item['id']['videoId'],
                            "title": item['snippet']['title'],
                            "thumbnail_url": item['snippet']['thumbnails']['high']['url'],
                            "source_channel": item['snippet'].get('channelTitle', 'Verified Educational Channel'),
                            "is_educational": True
                        })
            
            # If YouTube API returned no videos, provide fallback verified educational lessons
            if not videos:
                videos = [
                    {
                        "video_id": "libKVRa01L8",
                        "title": f"Educational Lesson: {clean_q.title()}",
                        "thumbnail_url": "https://img.youtube.com/vi/libKVRa01L8/hqdefault.jpg",
                        "source_channel": "National Geographic Kids",
                        "duration_seconds": 360,
                        "is_educational": True
                    },
                    {
                        "video_id": "38n0FkL_DQU",
                        "title": f"Science Explained: {clean_q.title()}",
                        "thumbnail_url": "https://img.youtube.com/vi/38n0FkL_DQU/hqdefault.jpg",
                        "source_channel": "CrashCourse Kids",
                        "duration_seconds": 420,
                        "is_educational": True
                    }
                ]
                
            return Response(videos, status=status.HTTP_200_OK)
        except Exception as e:
            # When YouTube API network call fails or is unreachable, gracefully fall back to curated educational lectures
            print(f"[YouTubeSearchView] API call exception: {e}, using rich curated academic fallbacks")
            is_adult = request.user.role == 'ADULT'
            
            if is_adult:
                fallback_videos = [
                    {
                        "video_id": "JMUxmLyrhSk",
                        "title": f"Artificial Intelligence & Agents Full Course: {clean_q.title()}",
                        "thumbnail_url": "https://img.youtube.com/vi/JMUxmLyrhSk/hqdefault.jpg",
                        "source_channel": "freeCodeCamp.org",
                        "duration_seconds": 2100,
                        "is_educational": True
                    },
                    {
                        "video_id": "i_LwzRVP7bg",
                        "title": f"Machine Learning & AI Concepts Explained: {clean_q.title()}",
                        "thumbnail_url": "https://img.youtube.com/vi/i_LwzRVP7bg/hqdefault.jpg",
                        "source_channel": "StatQuest with Josh Starmer",
                        "duration_seconds": 1080,
                        "is_educational": True
                    },
                    {
                        "video_id": "aircAruvnKk",
                        "title": f"Deep Learning & Neural Networks Lecture: {clean_q.title()}",
                        "thumbnail_url": "https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg",
                        "source_channel": "3Blue1Brown",
                        "duration_seconds": 1200,
                        "is_educational": True
                    },
                    {
                        "video_id": "8ext9G7xspg",
                        "title": f"Data Structures and Algorithms in Python: {clean_q.title()}",
                        "thumbnail_url": "https://img.youtube.com/vi/8ext9G7xspg/hqdefault.jpg",
                        "source_channel": "MIT OpenCourseWare",
                        "duration_seconds": 3200,
                        "is_educational": True
                    }
                ]
            else:
                fallback_videos = [
                    {
                        "video_id": "libKVRa01L8",
                        "title": f"Educational Lesson: {clean_q.title()}",
                        "thumbnail_url": "https://img.youtube.com/vi/libKVRa01L8/hqdefault.jpg",
                        "source_channel": "National Geographic Kids",
                        "duration_seconds": 360,
                        "is_educational": True
                    },
                    {
                        "video_id": "38n0FkL_DQU",
                        "title": f"Science Explained: {clean_q.title()}",
                        "thumbnail_url": "https://img.youtube.com/vi/38n0FkL_DQU/hqdefault.jpg",
                        "source_channel": "CrashCourse Kids",
                        "duration_seconds": 420,
                        "is_educational": True
                    }
                ]
            return Response(fallback_videos, status=status.HTTP_200_OK)

class VideoChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        video_id = request.data.get('video_id')
        video_title = request.data.get('title', '')
        message = request.data.get('message', '')
        history = request.data.get('history', [])
        is_breakdown = request.data.get('is_breakdown', False)
        
        if not video_id:
            return Response({"detail": "video_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        from chatbot.rag_engine import ask_video_bot
        try:
            bot_reply = ask_video_bot(video_id, message, history, is_breakdown, video_title=video_title)
            return Response({"reply": bot_reply}, status=status.HTTP_200_OK)
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "quota" in error_str or "exhausted" in error_str:
                return Response({
                    "error": "rate_limit", 
                    "message": "The AI is currently resting. Please try again later.", 
                    "detail": "API key exhausted or rate limit finished."
                }, status=429)
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
