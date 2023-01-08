import { SyntheticEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addNewPost } from '../features/posts/postsSlice';
import { selectAllUsers } from '../features/users/usersSlice';
import { useNavigate } from 'react-router-dom';

const AddPostForm = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [userId, setUserId] = useState(0);
    const [addReqStatus, setAddReqStatus] = useState('idle');

    const users = useAppSelector(selectAllUsers);

    const onTitleChanged = (e: SyntheticEvent) =>
        setTitle((e.target as HTMLTextAreaElement).value);
    const onContentChanged = (e: SyntheticEvent) =>
        setContent((e.target as HTMLTextAreaElement).value);
    const onAuthorChanged = (e: SyntheticEvent) =>
        setUserId(+(e.target as HTMLTextAreaElement).value);

    const canSave = [title, content, userId].every(Boolean) && addReqStatus === 'idle';

    const onSavePostClicked = () => {
        if (canSave) {
            try {
                setAddReqStatus('pending');
                dispatch(addNewPost({title, body: content, userId})).unwrap();
    
                setTitle('');
                setContent('');
                setUserId(0);
                navigate('/');
            } catch (error) {
                console.error('Failed to save the post', error)
            } finally {
                setAddReqStatus('idle');
            }
        }
    };

    const usersOptions = users.map((user) => (
        <option key={user.id} value={user.id}>
            {user.name}
        </option>
    ));

    return (
        <section>
            <h2>Add a New Post</h2>
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
            </form>
        </section>
    );
};

export default AddPostForm;
