import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";

describe("Login Form", () => {
  test("render email input", () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  test("render password input", () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("render submit button", () => {
    render(<LoginPage />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
