import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";
import RegisterPage from "@/app/(auth)/register/page";

describe("Register Form", () => {
  // 1
  test("render name input", () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
  });

  // 2
  test("render email input", () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  // 3
  test("render password input", () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  // 4
  test("render submit button", () => {
    render(<RegisterPage />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  // 5
  test("show required errors", async () => {
    render(<RegisterPage />);

    const button = screen.getByRole("button");

    await userEvent.click(button);

    expect(screen.getByText("Tên là bắt buộc")).toBeInTheDocument();
  });

  // 6
  test("render phone input", () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText("Phone number")).toBeInTheDocument();
  });

  // test("show invalid email error", async () => {
  //   render(<RegisterPage />)

  //   await userEvent.type(
  //       screen.getByPlaceholderText("Email"),
  //       "abc"
  //   )

  //   await userEvent.click(screen.getByRole("button"))

  //   await waitFor(() => {
  //       expect(
  //       screen.getByText("Email không hợp lệ")
  //       ).toBeInTheDocument()
  //   })
  //   })

  // 7
  test("typing input", async () => {
    render(<RegisterPage />);

    const input = screen.getByPlaceholderText("Name");

    await userEvent.type(input, "Duc");

    expect(input).toHaveValue("Duc");
  });

  // 8
  test("password mismatch", async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByPlaceholderText("Password"), "12345678");

    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "11111111");

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByText("Mật khẩu không khớp")).toBeInTheDocument();
  });
});
