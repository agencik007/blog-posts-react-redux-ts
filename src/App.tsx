import { Route, Routes, Navigate } from 'react-router-dom';
import PostsList from './components/PostsList';
import AddPostForm from './components/AddPostForm';
import SinglePostPage from './components/SinglePostPage';
import EditPostForm from './components/EditPostForm';
import UsersList from './components/UsersList';
import UserPage from './components/UserPage';
import Layout from './components/Layout';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<PostsList />} />

                <Route path="post">
                    <Route index element={<AddPostForm />} />
                    <Route path=":postId" element={<SinglePostPage />} />
                    <Route path="edit/:postId" element={<EditPostForm />} />
                </Route>

                <Route path="user">
                    <Route index element={<UsersList />} />
                    <Route path=":userId" element={<UserPage />} />
                </Route>

                {/* Catch all - replace with 404 component if you want */}
                <Route path="*" element={<Navigate to="/" replace />} />
                
            </Route>
        </Routes>
    );
}

export default App;
