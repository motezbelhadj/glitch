from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Song, Playlist
from .serializers import SongSerializer, PlaylistSerializer
from .permissions import IsOwnerOrReadOnly

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'artist', 'album', 'genre']
    
    def get_queryset(self):
        queryset = Song.objects.all()
        
        # Filter by is_famous
        is_famous = self.request.query_params.get('is_famous', None)
        if is_famous is not None:
            queryset = queryset.filter(is_famous=is_famous.lower() == 'true')
            
        # Filter by genre
        genre = self.request.query_params.get('genre', None)
        if genre is not None:
            queryset = queryset.filter(genre__icontains=genre)
            
        # Filter by uploader
        uploader = self.request.query_params.get('uploader', None)
        if uploader is not None and uploader == 'me' and self.request.user.is_authenticated:
            queryset = queryset.filter(uploader=self.request.user)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(artist__icontains=search) | 
                Q(album__icontains=search) | 
                Q(genre__icontains=search)
            )
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        song = self.get_object()
        user = request.user
        
        # If user already disliked the song, remove the dislike
        if song.dislikes.filter(id=user.id).exists():
            song.dislikes.remove(user)
        
        # Toggle like
        if song.likes.filter(id=user.id).exists():
            song.likes.remove(user)
            return Response({'status': 'like removed'}, status=status.HTTP_200_OK)
        else:
            song.likes.add(user)
            return Response({'status': 'liked'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def dislike(self, request, pk=None):
        song = self.get_object()
        user = request.user
        
        # If user already liked the song, remove the like
        if song.likes.filter(id=user.id).exists():
            song.likes.remove(user)
        
        # Toggle dislike
        if song.dislikes.filter(id=user.id).exists():
            song.dislikes.remove(user)
            return Response({'status': 'dislike removed'}, status=status.HTTP_200_OK)
        else:
            song.dislikes.add(user)
            return Response({'status': 'disliked'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def liked(self, request):
        """Get all songs liked by the current user"""
        user = request.user
        queryset = Song.objects.filter(likes=user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        user = self.request.user
        # Show public playlists and user's own playlists
        return Playlist.objects.filter(Q(is_public=True) | Q(user=user))
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
        
    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        
        if not song_id:
            return Response({'error': 'No song ID provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            song = Song.objects.get(pk=song_id)
            playlist.songs.add(song)
            return Response({'status': 'song added'}, status=status.HTTP_200_OK)
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)
            
    @action(detail=True, methods=['post'])
    def remove_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        
        if not song_id:
            return Response({'error': 'No song ID provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            song = Song.objects.get(pk=song_id)
            playlist.songs.remove(song)
            return Response({'status': 'song removed'}, status=status.HTTP_200_OK)
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)
