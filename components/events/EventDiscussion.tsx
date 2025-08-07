import React, { useState } from 'react';
import { type EventComment, type User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface EventCommentCardProps {
    comment: EventComment;
}

const EventCommentCard: React.FC<EventCommentCardProps> = ({ comment }) => {
    const formattedTime = comment.createdAt.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    return (
        <div className="flex items-start space-x-3 py-4">
            <img src={comment.author.profilePictureUrl} alt={comment.author.name} className="w-10 h-10 object-cover" />
            <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                    <p className="font-bold text-black">{comment.author.name}</p>
                    <p className="text-xs text-neutral-500">{formattedTime}</p>
                </div>
                <p className="text-sm text-neutral-800 whitespace-pre-wrap">{comment.content}</p>
            </div>
        </div>
    )
};

interface EventDiscussionProps {
    eventId: string;
}

const EventDiscussion: React.FC<EventDiscussionProps> = ({ eventId }) => {
    const { currentUser } = useAuth();
    const { eventComments, postComment } = useData();
    const [newComment, setNewComment] = useState('');

    if (!currentUser) return null;
    
    const comments = eventComments.filter(c => c.eventId === eventId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            postComment(eventId, newComment, currentUser);
            setNewComment('');
        }
    };

    return (
        <div className="bg-white rounded-none border border-black">
            <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-black mb-4">Event Discussion</h2>
                
                <div className="divide-y divide-neutral-200">
                    {comments.length > 0 ? (
                        comments
                            .sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime())
                            .map(comment => <EventCommentCard key={comment.id} comment={comment} />)
                    ) : (
                        <p className="py-4 text-center text-sm text-neutral-500">No comments yet. Start the conversation!</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="mt-6 flex items-start space-x-3">
                    <img src={currentUser.profilePictureUrl} alt={currentUser.name} className="w-10 h-10 object-cover" />
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add to the discussion..."
                            rows={2}
                            className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
                            required
                        />
                        <button
                            type="submit"
                            className="mt-2 text-sm font-semibold bg-[#d81313] text-white px-4 py-2 hover:bg-[#b81010]"
                        >
                            Post Comment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventDiscussion;
