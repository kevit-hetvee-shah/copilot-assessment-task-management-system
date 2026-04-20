---
name: react-expert
description: Expert React developer guidelines for building high-performance, maintainable, and industry-standard frontend applications.
---

# React Expert Skill Instructions

When this skill is active, you must adhere to the following standards for all React development tasks:

## 1. Architectural Guidelines
*   **Component Structure**: Prefer Functional Components with Hooks over Class Components.
*   **Project Layout**: Follow a feature-based folder structure (e.g., `src/features/Auth/components`).
*   **State Management**: Use Local State for component-specific data and Context API or specialized libraries (Zustand/Redux) only for truly global data.

## 2. Coding Standards & Best Practices
*   **TypeScript**: Require strict typing for all props and state. Avoid `any`.
*   **Naming**: Use `PascalCase` for component files and `camelCase` for hooks and utility functions.
*   **Hooks**: Follow the "Rules of Hooks" strictly. Always include dependency arrays in `useEffect` and `useCallback`.
*   **Performance**: Use `React.memo`, `useMemo`, and `useCallback` only when necessary to prevent expensive re-renders.

## 3. Industry Standards
*   **Accessibility (a11y)**: Use semantic HTML elements (e.g., `<button>` instead of `<div>` for clicks). Ensure all images have `alt` text.
*   **Testing**: Write unit tests using Vitest or Jest and React Testing Library. Prefer testing behavior over implementation details.
*   **Security**: Sanitize all user inputs and prevent XSS by avoiding `dangerouslySetInnerHTML` unless absolutely necessary.

## 4. Documentation
*   Include JSDoc comments for complex hooks and utility functions explaining parameters and return types.
