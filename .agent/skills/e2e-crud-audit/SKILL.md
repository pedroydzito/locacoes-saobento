---
name: e2e-crud-audit
description: E2E CRUD Audit skill to ensure complete Create, Read, Update, Delete functionality across all screens.
allowed-tools: Read, Write, Edit
---

# E2E CRUD Audit Protocol

> Verify and guarantee complete CRUD lifecycle on all application screens and accesses.

## 1. Audit Strategy

### Objective
Ensure that every entity managed in the application has a complete, functional Create, Read, Update, and Delete (CRUD) flow, even if relying on in-memory mock data or real backend context.

### Coverage Targets
1. **Pages / Screens**: All `.tsx` components in `src/pages/` representing entities (e.g., Machines, Freights, Clients, Operators, Services, Finance).
2. **Forms**: All components in `src/components/forms/` that handle Create and Update actions.
3. **Data State**: Ensure changes persist at least in the session state (updating the imported arrays) and reflect immediately in the UI.

## 2. CRUD Verification Checklist

For each entity screen, verify:

### 🟢 Create
- [ ] "New [Entity]" button exists.
- [ ] Opens a modal or page with a form.
- [ ] Submitting the form actually pushes a new item to the data source (e.g., `mockArray.unshift(newItem)` or API call).
- [ ] UI refreshes to show the new item (e.g., `setRefreshKey` or state update).

### 🔵 Read
- [ ] List or Table displays all records correctly.
- [ ] Data maps perfectly to the UI.
- [ ] Details view (if applicable) loads the specific item.

### 🟡 Update
- [ ] "Edit" button exists on the list/table item or details page.
- [ ] Opens a form pre-filled with the current item data.
- [ ] Submitting the form modifies the existing item in the data source.
- [ ] UI refreshes to show the updated item.

### 🔴 Delete
- [ ] "Delete" button exists and requires confirmation.
- [ ] Confirming actually removes the item from the data source (e.g., `mockArray.splice(index, 1)` or API call).
- [ ] UI refreshes and removes the item from the view.

## 3. Implementation Steps for AI Agent

When running this skill:
1. **List all entity screens**: Identify all files in `src/pages/` and `src/components/forms/`.
2. **Check Delete Methods**: Search for `confirmDelete` or `handleDelete` functions. Often, these are left as `// Logic to delete would go here`. Fix them by implementing the array splice/filter and state refresh.
3. **Check Create Methods**: Verify the `handleSave` or `onSubmit` methods in forms push data. Ensure ID generation works.
4. **Check Update Methods**: Verify that `handleUpdate` or `onSubmit` properly finds the index and overwrites the data.
5. **Report**: Document every file changed and the specific CRUD operations that were fixed or added.
