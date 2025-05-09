from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Song, Playlist
from .serializers import SongSerializer, PlaylistSerializer
from .permissions import IsOwnerOrReadOnly

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
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
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)

class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        # Show public playlists and user's own playlists
        return Playlist.objects.filter(is_public=True) | Playlist.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
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
