from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # For songs, check if the user is the uploader
        if hasattr(obj, 'uploader'):
            return obj.uploader == request.user
            
        # For playlists, check if the user is the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        return False
