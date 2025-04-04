import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const BOOKMARKS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export type BookmarkMovie = Pick<
  Movie,
  "id" | "poster_path" | "title" | "vote_average" | "release_date"
>;

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const toggleBookmark = async (movie: BookmarkMovie, userId: string) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      BOOKMARKS_COLLECTION_ID,
      [Query.equal("movie_id", movie.id), Query.equal("user_id", userId)]
    );

    if (result.documents.length > 0) {
      // Remove bookmark
      await database.deleteDocument(
        DATABASE_ID,
        BOOKMARKS_COLLECTION_ID,
        result.documents[0].$id
      );
      return false; // Return false to indicate bookmark was removed
    } else {
      // Add bookmark
      await database.createDocument(
        DATABASE_ID,
        BOOKMARKS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: userId,
          movie_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
          created_at: new Date(),
        }
      );
      return true; // Return true to indicate bookmark was added
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
};

export const getBookmarkedMovies = async (
  userId: string
): Promise<BookmarkMovie[]> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      BOOKMARKS_COLLECTION_ID,
      [Query.equal("user_id", userId), Query.orderDesc("created_at")]
    );

    return result.documents.map((doc) => ({
      id: doc.movie_id,
      poster_path: doc.poster_path,
      title: doc.title,
      vote_average: doc.vote_average,
      release_date: doc.release_date,
    })) as BookmarkMovie[];
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
};
