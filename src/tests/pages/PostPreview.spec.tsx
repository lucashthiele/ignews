import { render, screen } from "@testing-library/react";
import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { mocked } from "jest-mock";
import { getPrismicClient } from "../../services/prismic";
import { getSession, useSession } from "next-auth/client";
import { useRouter } from "next/router";

jest.mock("../../services/prismic");
jest.mock("next-auth/client");
jest.mock("next/router");

const post = {
  slug: "my-new-post",
  title: "My New Post",
  content: "<p>Post excerpt</p>",
  updatedAt: "10 de Abril",
};
describe("Post Preview page", () => {
  it("should renders correctly", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<Post post={post} />);

    expect(screen.getByText("My New Post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("should redirect user to full post if user is subscribed", async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocekd = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: "fake-subscription" },
      false,
    ] as any);

    useRouterMocekd.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<Post post={post} />);

    expect(pushMock).toHaveBeenCalledWith("/posts/my-new-post");
  });

  it("should load intial data", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "My New Post" }],
          content: [{ type: "paragraph", text: "Post excerpt" }],
        },
        last_publication_date: "04-01-2021",
      }),
    } as any);

    const response = await getStaticProps({
      params: {
        slug: "my-new-post",
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "my-new-post",
            title: "My New Post",
            content: "<p>Post excerpt</p>",
            updatedAt: "01 de abril de 2021",
          },
        },
      })
    );
  });
});
