// This file generates `data/recent-blog-posts.json` without a full website build.
// Used for faster lint/typecheck.
import recentBlogPostsPlugin from '../plugins/recent-blog-posts';

void recentBlogPostsPlugin();
