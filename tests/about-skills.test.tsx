import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";

describe("About", () => {
  it("renders info list, story and motto", () => {
    render(<About />);
    expect(document.getElementById("about")).not.toBeNull();
    expect(document.querySelectorAll(".about-info li")).toHaveLength(4);
    expect(screen.getByText(/之を楽しむ者に如かず/)).toBeInTheDocument();
    expect(screen.getByText("「楽しむ者」")).toBeInTheDocument();
    expect(screen.getByText("素材待ち:プロフィール写真")).toBeInTheDocument();
  });
});

describe("Skills", () => {
  it("renders 5 stack rows with pills", () => {
    render(<Skills />);
    expect(document.getElementById("skills")).not.toBeNull();
    expect(document.querySelectorAll(".stack-row")).toHaveLength(5);
    expect(screen.getByText("PyTorch")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });
});
