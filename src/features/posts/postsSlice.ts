import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { sub } from 'date-fns';
import axios from 'axios';

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

export interface PostState {
    userId?: number;
    id: number;
    title: string;
    body: string;
    date: string;
    reactions: {
        thumbsUp: number;
        wow: number;
        heart: number;
        rocket: number;
        coffee: number;
    };
}

export interface PostsState {
    posts: PostState[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | undefined | null;
}

const initialState: PostsState = {
    posts: [],
    status: 'idle',
    error: null
};

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    const response = await axios.get(POSTS_URL);
    return response.data;
});

export const addNewPost = createAsyncThunk(
    'posts/addNewPost',
    async (initialPost: Partial<PostState>) => {
        const response = await axios.post(POSTS_URL, initialPost);
        return response.data;
    }
);

export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async (initialPost: Partial<PostState>) => {
        const { id } = initialPost;
        try {
            const response = await axios.put(`${POSTS_URL}/${id}`, initialPost);
            return response.data;
        } catch (err) {
            //return err.message;
            return initialPost; // only for testing Redux!
        }
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (initialPost: Partial<PostState>) => {
        const { id } = initialPost;
        try {
            const response = await axios.delete(`${POSTS_URL}/${id}`);
            if (response?.status === 200) return initialPost;
            return `${response?.status}: ${response?.statusText}`;
        } catch (err: any) {
            return err.message;
        }
    }
);

export const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        postAdded: {
            reducer(state, action: PayloadAction<PostState>) {
                state.posts.push(action.payload);
            },
            prepare(title: string, body: string, userId: number) {
                return {
                    payload: {
                        id: Math.floor(Math.random() + 10) + 1,
                        title,
                        body,
                        date: new Date().toISOString(),
                        userId,
                        reactions: {
                            thumbsUp: 0,
                            wow: 0,
                            heart: 0,
                            rocket: 0,
                            coffee: 0
                        }
                    }
                };
            }
        },
        reactionAdded(state: PostsState, action) {
            const { postId, reaction } = action.payload;

            const existingPost = state.posts.find((post) => post.id === postId);

            if (existingPost) {
                existingPost.reactions[
                    reaction as keyof PostState['reactions']
                ]++;
            }
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchPosts.pending, (state, action) => {
                state.status = 'loading';
            })
            .addCase(
                fetchPosts.fulfilled,
                (state, action: PayloadAction<PostState[]>) => {
                    state.status = 'succeeded';
                    // Adding date and reactions
                    let min = 1;
                    const loadedPosts = action.payload.map((post) => {
                        post.date = sub(new Date(), {
                            minutes: min++
                        }).toISOString();
                        post.reactions = {
                            thumbsUp: 0,
                            wow: 0,
                            heart: 0,
                            rocket: 0,
                            coffee: 0
                        };
                        return post;
                    });

                    state.posts = loadedPosts;
                }
            )
            .addCase(fetchPosts.rejected, (state: PostsState, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(
                addNewPost.fulfilled,
                (state, action: PayloadAction<PostState>) => {
                    const sortedPosts = state.posts.sort((a, b) => {
                        if (a.id! > b.id!) return 1;
                        if (a.id! < b.id!) return -1;
                        return 0;
                    });

                    action.payload.id =
                        sortedPosts[sortedPosts.length - 1].id + 1;
                    // End fix for fake API post IDs

                    action.payload.userId = Number(action.payload.userId);
                    action.payload.date = new Date().toISOString();
                    action.payload.reactions = {
                        thumbsUp: 0,
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                        coffee: 0
                    };
                    state.posts.push(action.payload);
                }
            )
            .addCase(updatePost.fulfilled, (state, action: PayloadAction<PostState>) => {
                if (!action.payload?.id) {
                    console.log('Update could not complete')
                    console.log(action.payload)
                    return;
                }
                const { id } = action.payload;
                action.payload.date = new Date().toISOString();
                const posts = state.posts.filter(post => post.id !== id);
                state.posts = [...posts, action.payload];
            })
            .addCase(deletePost.fulfilled, (state, action: PayloadAction<PostState>) => {
                if (!action.payload?.id) {
                    console.log('Delete could not complete')
                    console.log(action.payload)
                    return;
                }
                const { id } = action.payload;
                const posts = state.posts.filter(post => post.id !== id);
                state.posts = posts;
            })
    }
});

export const selectAllPosts = (state: RootState) => state.posts.posts;
export const getPostsStatus = (state: RootState) => state.posts.status;
export const getPostsError = (state: RootState) => state.posts.error;

export const selectPostById = (state: RootState, postId: number) =>
    state.posts.posts.find((post) => post.id === postId);

export const { postAdded, reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;
