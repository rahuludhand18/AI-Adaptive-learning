from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from kids.models import Quest, QuestCompletion, DailyPuzzle, PuzzleAttempt
from rewards.models import StarReward


# Add stars to a child's wallet and return the new balance.
def _award(child, amount):
    wallet, _ = StarReward.objects.get_or_create(child=child)
    wallet.stars_earned += amount
    wallet.save()
    return wallet.balance


class QuestListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        done = set(QuestCompletion.objects.filter(child=request.user).values_list('quest_id', flat=True))
        quests = [{
            'id': q.id, 'title': q.title, 'subtitle': q.subtitle,
            'reward_stars': q.reward_stars, 'icon': q.icon, 'completed': q.id in done,
        } for q in Quest.objects.filter(is_active=True)]
        return Response(quests)


class QuestCompleteView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            quest = Quest.objects.get(pk=pk, is_active=True)
        except Quest.DoesNotExist:
            return Response({'detail': 'Quest not found.'}, status=status.HTTP_404_NOT_FOUND)
        _, created = QuestCompletion.objects.get_or_create(child=request.user, quest=quest)
        balance = _award(request.user, quest.reward_stars) if created else None
        return Response({'completed': True, 'awarded': quest.reward_stars if created else 0, 'balance': balance})


class TodayPuzzleView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        puzzle = DailyPuzzle.objects.filter(is_active=True).order_by('id').first()
        if not puzzle:
            return Response({'puzzle': None})
        attempt = PuzzleAttempt.objects.filter(child=request.user, puzzle=puzzle).first()
        return Response({
            'puzzle': {'id': puzzle.id, 'question': puzzle.question, 'options': puzzle.options, 'reward_stars': puzzle.reward_stars},
            'attempted': bool(attempt),
            'was_correct': attempt.correct if attempt else None,
        })


class PuzzleAnswerView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            puzzle = DailyPuzzle.objects.get(pk=pk, is_active=True)
        except DailyPuzzle.DoesNotExist:
            return Response({'detail': 'Puzzle not found.'}, status=status.HTTP_404_NOT_FOUND)
        if PuzzleAttempt.objects.filter(child=request.user, puzzle=puzzle).exists():
            return Response({'detail': 'Already attempted.', 'already': True}, status=status.HTTP_200_OK)
        try:
            option = int(request.data.get('option', -1))
        except (TypeError, ValueError):
            option = -1
        correct = option == puzzle.correct_index
        PuzzleAttempt.objects.create(child=request.user, puzzle=puzzle, correct=correct)
        balance = _award(request.user, puzzle.reward_stars) if correct else None
        return Response({
            'correct': correct,
            'correct_index': puzzle.correct_index,
            'awarded': puzzle.reward_stars if correct else 0,
            'balance': balance,
        })
