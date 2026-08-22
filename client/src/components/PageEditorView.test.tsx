// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PageEditorView from "@/components/PageEditorView";

const uploadMutation = { isPending: false, mutate: vi.fn() };
vi.mock("@/lib/trpc", () => ({ trpc: { content: { uploadImage: { useMutation: () => uploadMutation } } } }));

describe("PageEditorView Services Grid controls", () => {
  it("renders saved values and includes edited grid fields in the save payload", () => {
    const onSave = vi.fn();
    const sections = [{
      key: "page_editor_services",
      content: JSON.stringify({
        gridCardBgLight: "#123456",
        gridCardRadius: "24px",
        gridCardOpacity: "0.82",
        gridTextColorDark: "#f7eee5",
      }),
    }];

    render(<PageEditorView sections={sections} onSave={onSave} saving={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Services/ }));

    expect(screen.getByText("Services Grid Styling (تحكم شبكة الخدمات)")).toBeTruthy();
    expect(screen.getByDisplayValue("24px")).toBeTruthy();
    expect((screen.getByPlaceholderText("#fffaf4") as HTMLInputElement).value).toBe("#123456");
    expect(screen.getByDisplayValue("0.82")).toBeTruthy();
    expect((screen.getByPlaceholderText("#f7eee5") as HTMLInputElement).value).toBe("#f7eee5");

    fireEvent.change(screen.getByDisplayValue("24px"), { target: { value: "30px" } });
    fireEvent.change(screen.getByPlaceholderText("#fffaf4"), { target: { value: "rgba(18,52,86,.8)" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Services settings" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    const content = JSON.parse(payload.content);
    expect(payload.key).toBe("page_editor_services");
    expect(content.gridCardRadius).toBe("30px");
    expect(content.gridCardBgLight).toBe("rgba(18,52,86,.8)");
    expect(content.gridCardOpacity).toBe("0.82");
    expect(content.gridTextColorDark).toBe("#f7eee5");
  });
});
