from rest_framework import serializers
from .models import Song, Playlist

class SongSerializer(serializers.ModelSerializer):
    uploader_username = serializers.ReadOnlyField(source='uploader.username')
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_disliked = serializers.SerializerMethodField()
    
    class Meta:
        model = Song
        fields = (
            'id', 'title', 'artist', 'album', 'genre', 'year', 'duration',
            'audio_file', 'cover_image', 'is_famous', 'uploader', 'uploader_username',
            'like_count', 'dislike_count', 'is_liked', 'is_disliked',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'uploader', 'uploader_username', 
                           'like_count', 'dislike_count', 'is_liked', 'is_disliked')
    
    def get_like_count(self, obj):
        return obj.likes.count()
    
    def get_dislike_count(self, obj):
        return obj.dislikes.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def get_is_disliked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.dislikes.filter(id=request.user.id).exists()
        return False

class PlaylistSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)
    song_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True,
        queryset=Song.objects.all(),
        required=False,
        source='songs'
    )
    
    class Meta:
        model = Playlist
        fields = (
            'id', 'name', 'description', 'cover_image', 'user',
            'songs', 'song_ids', 'is_public', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')
