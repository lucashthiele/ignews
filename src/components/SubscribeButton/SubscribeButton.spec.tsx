import { render, screen, fireEvent } from "@testing-library/react";
import { signIn, useSession } from "next-auth/client";
import { SubscribeButton } from ".";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";

jest.mock("next-auth/client");
jest.mock("next/router");

describe("SubscribeButton component", () => {
  it("should renders correctly", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);

    expect(screen.getByText("Subscribe Now")).toBeInTheDocument();
  });

  it("should redirects user to sign in when not authenticated", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    const signInMocked = mocked(signIn);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe Now");

    fireEvent.click(subscribeButton);

    expect(signInMocked).toHaveBeenCalled();
  });

  it("should redirects to posts when user already have subscriptions", () => {
    const useRouterMocked = mocked(useRouter);

    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: "John Doe", email: "john.doe@example.com" },
        activeSubscription: "fake-active-subscription",
        expires: "fake-expires",
      },
      false,
    ]);

    const pushMock = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe Now");

    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith("/posts");
  });
});
