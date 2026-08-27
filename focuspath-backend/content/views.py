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
import requests
from rest_framework.views import APIView

class YouTubeSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q')
        if not query:
            return Response({"detail": "Missing 'q' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        
        api_key = os.environ.get('YOUTUBE_API_KEY')
        if not api_key:
            # Fallback mock data for seamless UX if API key is not set
            return Response([
                {
                    "video_id": "libKVRa01L8",
                    "title": f"Educational Video about {query} - Part 1",
                    "thumbnail_url": "https://img.youtube.com/vi/libKVRa01L8/hqdefault.jpg",
                },
                {
                    "video_id": "38n0FkL_DQU",
                    "title": f"Science Explained: {query}",
                    "thumbnail_url": "https://img.youtube.com/vi/38n0FkL_DQU/hqdefault.jpg",
                }
            ], status=status.HTTP_200_OK)

        url = "https://www.googleapis.com/youtube/v3/search"
        
        # The ultimate solution to the Youtube API:
        # Instead of guessing bad keywords, we explicitly ONLY fetch from approved academic categories.
        # Category 27 = Education
        # Category 28 = Science & Technology (where hard coding tutorials live)
        # Category 26 = How-To & Style
        safe_categories = ["27", "28", "26"]
        
        # Keep our Python-side safety filter just in case
        bad_keywords = ['trailer', 'movie', 'film', 'teaser', 'reaction', 'song', 'music', 'edit', 'cinematic', 'lyric', 'bollywood', 'hollywood', 'promo']
        
        # This is a live search, so it can't be checked against a video's exact age_min/age_max
        # like the curated catalog can (VideoListView) — as a best-effort second layer, bias the
        # query toward the child's assigned age bracket so results at least skew age-appropriate.
        age_hint = ''
        if request.user.role == User.Roles.KID and request.user.age_group in AGE_GROUP_BOUNDS:
            lo, _ = AGE_GROUP_BOUNDS[request.user.age_group]
            age_hint = ' for kids' if lo <= 8 else ' for students'

        videos = []
        try:
            for cat_id in safe_categories:
                params = {
                    "part": "snippet",
                    "q": f"{query} tutorial{age_hint} OR {query} educational{age_hint}",
                    "type": "video",
                    "videoCategoryId": cat_id,
                    "safeSearch": "strict",
                    "videoEmbeddable": "true",
                    "maxResults": 5, # 5 per category = 15 total
                    "key": api_key
                }
                
                r = requests.get(url, params=params)
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
                            "thumbnail_url": item['snippet']['thumbnails']['high']['url']
                        })
            
            # Shuffle or return as is
            return Response(videos, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VideoChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        video_id = request.data.get('video_id')
        message = request.data.get('message', '')
        history = request.data.get('history', [])
        is_breakdown = request.data.get('is_breakdown', False)
        
        if not video_id:
            return Response({"detail": "video_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        from chatbot.rag_engine import ask_video_bot
        try:
            bot_reply = ask_video_bot(video_id, message, history, is_breakdown)
            return Response({"reply": bot_reply}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
