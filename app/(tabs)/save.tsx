import { useEffect, useState } from "react";
import { View, Text, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants/icons";
import { getBookmarkedMovies, type BookmarkMovie } from "@/services/appwrite";
import MovieCard from "@/components/MovieCard";

const Save = () => {
  const [bookmarkedMovies, setBookmarkedMovies] = useState<BookmarkMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const userId = "current-user-id"; // Replace with actual user ID from your auth system
      const movies = await getBookmarkedMovies(userId);
      setBookmarkedMovies(movies);
      setLoading(false);
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="bg-primary flex-1 px-10">
        <View className="flex justify-center items-center flex-1">
          <Text className="text-white">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (bookmarkedMovies.length === 0) {
    return (
      <SafeAreaView className="bg-primary flex-1 px-10">
        <View className="flex justify-center items-center flex-1 flex-col gap-5">
          <Image source={icons.save} className="size-10" tintColor="#fff" />
          <Text className="text-gray-500 text-base">No saved movies yet</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary flex-1 px-4">
      <Text className="text-white text-2xl font-bold mb-4">Saved Movies</Text>
      <FlatList
        data={bookmarkedMovies}
        renderItem={({ item }) => <MovieCard {...item} isBookmarked={true} />}
        numColumns={3}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ gap: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Save;
