"use client";

import { useId, useState } from "react";
import { fieldLabel, selectClasses } from "./form-parts";

const NEW = "__new__";

interface CategoryFieldProps {
  categories: { slug: string; label: string }[];
}

/**
 * Pick an existing category or name a new one.
 *
 * Both paths submit the same `category` field, so the action does not need to
 * know which branch the editor took — it slugifies whatever arrives and
 * creates the category if it does not exist yet.
 */
export function CategoryField({ categories }: CategoryFieldProps) {
  const id = useId();
  const [choice, setChoice] = useState(categories[0]?.slug ?? NEW);
  const creating = choice === NEW || categories.length === 0;

  return (
    <div>
      <label htmlFor={`${id}-category`} className={fieldLabel}>
        Category
      </label>

      {categories.length > 0 ? (
        <select
          id={`${id}-category`}
          value={choice}
          onChange={(event) => setChoice(event.target.value)}
          // Not the submitted field when creating: the text input below takes
          // over the `category` name so only one value is ever sent.
          name={creating ? undefined : "category"}
          className={selectClasses}
        >
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.label}
            </option>
          ))}
          <option value={NEW}>+ New category…</option>
        </select>
      ) : null}

      {creating ? (
        <>
          <input
            type="text"
            name="category"
            required
            placeholder="e.g. Events"
            aria-label="New category name"
            onChange={(event) => {
              // Mirror the typed name into the label field so the gallery tab
              // reads "Real Estate", not "real-estate".
              const form = event.target.form;
              const label = form?.elements.namedItem("categoryLabel");
              if (label instanceof HTMLInputElement) label.value = event.target.value;
            }}
            className={selectClasses}
          />
          <input type="hidden" name="categoryLabel" defaultValue="" />
        </>
      ) : null}
    </div>
  );
}
