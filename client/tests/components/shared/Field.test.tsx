import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FormField,
} from "@/components/shared/Field";
import { I18nTestProvider } from "../../helpers/i18nTestProvider";

describe("Field Components", () => {
  describe("FormField", () => {
    it("renders label and children", () => {
      render(
        <I18nTestProvider>
          <FormField label="Test Label" htmlFor="test">
            <input id="test" />
          </FormField>
        </I18nTestProvider>,
      );

      expect(screen.getByText("Test Label")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("shows required indicator when required", () => {
      render(
        <I18nTestProvider>
          <FormField label="Required Field" htmlFor="required" required={true}>
            <input id="required" />
          </FormField>
        </I18nTestProvider>,
      );

      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });

  describe("FieldGroup", () => {
    it("renders children in container", () => {
      render(
        <I18nTestProvider>
          <FieldGroup>
            <div data-testid="child">Child content</div>
          </FieldGroup>
        </I18nTestProvider>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  describe("Field", () => {
    it("renders with vertical orientation by default", () => {
      render(
        <I18nTestProvider>
          <Field data-testid="field">
            <span>Content</span>
          </Field>
        </I18nTestProvider>,
      );

      const field = screen.getByTestId("field");
      expect(field).toHaveAttribute("data-orientation", "vertical");
    });

    it("renders with horizontal orientation when specified", () => {
      render(
        <I18nTestProvider>
          <Field orientation="horizontal" data-testid="field">
            <span>Content</span>
          </Field>
        </I18nTestProvider>,
      );

      const field = screen.getByTestId("field");
      expect(field).toHaveAttribute("data-orientation", "horizontal");
    });
  });

  describe("FieldLabel", () => {
    it("renders label text", () => {
      render(
        <I18nTestProvider>
          <FieldLabel>My Label</FieldLabel>
        </I18nTestProvider>,
      );

      expect(screen.getByText("My Label")).toBeInTheDocument();
    });
  });

  describe("FieldDescription", () => {
    it("renders description text", () => {
      render(
        <I18nTestProvider>
          <FieldDescription>Helper text here</FieldDescription>
        </I18nTestProvider>,
      );

      expect(screen.getByText("Helper text here")).toBeInTheDocument();
    });
  });
});
