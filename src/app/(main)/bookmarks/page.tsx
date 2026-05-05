import { BookmarkList } from "./bookmark-list";
import { PageHero } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { getBookmarks } from "@/queries/bookmarks";

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks();

  return (
    <div className="w-full pb-16">
      <PageHero title="Bookmarks" subtitle="Your saved articles for later reading" />
      <Container>
        <BookmarkList bookmarks={bookmarks} />
      </Container>
    </div>
  );
}
