import { useState } from 'react';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/useAppStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CommunityPost } from '@/types';

interface CommunityTabProps {
  classId: string;
}

export const CommunityTab = ({ classId }: CommunityTabProps) => {
  const { currentUser, communityPosts, addCommunityPost, users } = useAppStore();
  const [newPost, setNewPost] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const classPosts = communityPosts
    .filter(post => post.classId === classId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmitPost = () => {
    if (!currentUser || !newPost.trim()) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      classId,
      authorId: currentUser.id,
      content: newPost.trim(),
      createdAt: new Date().toISOString(),
      likes: []
    };

    addCommunityPost(post);
    setNewPost('');
  };

  const handleSubmitReply = () => {
    if (!currentUser || !replyContent.trim() || !replyTo) return;

    const reply: CommunityPost = {
      id: Date.now().toString(),
      classId,
      authorId: currentUser.id,
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      parentId: replyTo,
      likes: []
    };

    addCommunityPost(reply);
    setReplyContent('');
    setReplyTo(null);
  };

  const getAuthor = (authorId: string) => {
    return users.find(u => u.id === authorId);
  };

  const getReplies = (postId: string) => {
    return classPosts.filter(post => post.parentId === postId);
  };

  const mainPosts = classPosts.filter(post => !post.parentId);

  return (
    <div className="space-y-6">
      {/* New Post */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Compartilhe suas ideias</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="O que você está pensando sobre o conteúdo da turma?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitPost}
              disabled={!newPost.trim()}
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <ScrollArea className="h-96">
        <div className="space-y-4">
          {mainPosts.map((post) => {
            const author = getAuthor(post.authorId);
            const replies = getReplies(post.id);

            return (
              <Card key={post.id} className="bg-card">
                <CardContent className="p-4">
                  {/* Post Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {author?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{author?.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {author?.role === 'professor' ? 'Professor' : 'Aluno'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-card-foreground mt-2">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes.length}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground"
                      onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Responder
                    </Button>
                  </div>

                  {/* Reply Form */}
                  {replyTo === post.id && (
                    <div className="mt-4 pl-11 space-y-3">
                      <Textarea
                        placeholder="Escreva sua resposta..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSubmitReply}>
                          Responder
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="mt-4 pl-11 space-y-3 border-l border-border">
                      {replies.map((reply) => {
                        const replyAuthor = getAuthor(reply.authorId);
                        return (
                          <div key={reply.id} className="flex items-start gap-3">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                {replyAuthor?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs">{replyAuthor?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(reply.createdAt), {
                                    addSuffix: true,
                                    locale: ptBR
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-card-foreground mt-1">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {mainPosts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Nenhuma discussão ainda</h3>
                <p className="text-sm text-muted-foreground">
                  Seja o primeiro a compartilhar suas ideias com a turma!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};