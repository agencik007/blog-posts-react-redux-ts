import { SyntheticEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
    selectPostById,
    updatePost,
    deletePost
} from '../features/posts/postsSlice';
import { useParams, useNavigate } from 'react-router-dom';

import { selectAllUsers } from '../features/users/usersSlice';

const EditPostForm = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const post = useAppSelector((state) =>
        selectPostById(state, Number(postId))
    );
    const users = useAppSelector(selectAllUsers);

    const [title, setTitle] = useState(post?.title);
    const [content, setContent] = useState(post?.body);
    const [userId, setUserId] = useState(post?.userId);
    const [requestStatus, setRequestStatus] = useState('idle');

    const dispatch = useAppDispatch();

    if (!post) {
        return (
            <section>
                <h2>Post not found!</h2>
            </section>
        );
    }

    const onTitleChanged = (e: SyntheticEvent) =>
        setTitle((e.target as HTMLTextAreaElement).value);
    const onContentChanged = (e: SyntheticEvent) =>
        setContent((e.target as HTMLTextAreaElement).value);
    const onAuthorChanged = (e: SyntheticEvent) =>
        setUserId(+(e.target as HTMLTextAreaElement).value);

    const canSave =
        [title, content, userId].every(Boolean) && requestStatus === 'idle';

    const onSavePostClicked = () => {
        if (canSave) {
            try {
                setRequestStatus('pending');
                dispatch(
                    updatePost({
                        id: post.id,
                        title,
                        body: content,
                        userId,
                        reactions: post.reactions
                    })
                ).unwrap();

                setTitle('');
                setContent('');
                setUserId(0);
                navigate(`/post/${postId}`);
            } catch (err) {
                console.error('Failed to save the post', err);
            } finally {
                setRequestStatus('idle');
            }
        }
    };

    const usersOptions = users.map((user) => (
        <option key={user.id} value={user.id}>
            {user.name}
        </option>
    ));

    const onDeletePostClicked = () => {
        try {
            setRequestStatus('pending');
            dispatch(deletePost({ id: post.id })).unwrap();

            setTitle('');
            setContent('');
            setUserId(0);
            navigate('/');
        } catch (err) {
            console.error('Failed to delete the post', err);
        } finally {
            setRequestStatus('idle');
        }
    };

    return (
        <section>
            <h2>Edit Post</h2>
            <form>
                <label htmlFor="postTitle">Post Title:</label>
                <input
                    type="text"
                    id="postTitle"
                    name="postTitle"
                    value={title}
                    onChange={onTitleChanged}
                />
                <label htmlFor="postAuthor">Author:</label>
                <select
                    id="postAuthor"
                    value={userId}
                    onChange={onAuthorChanged}
                >
                    <option value=""></option>
                    {usersOptions}
                </select>
                <label htmlFor="postContent">Content:</label>
                <textarea
                    id="postContent"
                    name="postContent"
                    value={content}
                    onChange={onContentChanged}
                />
                <button
                    type="button"
                    onClick={onSavePostClicked}
                    disabled={!canSave}
                >
                    Save Post
                </button>
                <button
                    className="deleteButton"
                    type="button"
                    onClick={onDeletePostClicked}
                >
                    Delete Post
                </button>
            </form>
        </section>
    );
};

export default EditPostForm;
