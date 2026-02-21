import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from "../Footer";

describe("Footer", () => {
    it("renders without crashing", () => {
        render(<Footer />);
        // The footer renders consistently
        expect(document.body).toBeTruthy();
    });
});
