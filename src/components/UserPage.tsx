import { useAppSelector } from '../app/hooks';
import { selectUserById } from '../features/users/usersSlice';
import { selectAllPosts } from '../features/posts/postsSlice';
import { Link, useParams } from 'react-router-dom';

const UserPage = () => {
    const { userId } = useParams();
    const user = useAppSelector((state) =>
        selectUserById(state, Number(userId))
    );

    const postsForUser = useAppSelector((state) => {
        const allPosts = selectAllPosts(state);
        return allPosts.filter((post) => post.userId === Number(userId));
    });

    const postTitles = postsForUser.map((post) => (
        <li key={post.id}>
            <Link to={`/post/${post.id}`}>{post.title}</Link>
        </li>
    ));

    return (
        <section>
            <h2>{user?.name}</h2>

            <ol>{postTitles}</ol>
        </section>
    );
};

export default UserPage;
