"use client";

import { FormEvent, useState } from "react";
import { CreateContainerInput } from "@/lib/types";
import { normalizeTags } from "@/lib/utils";

type ContainerFormProps = {
  onCreate: (input: CreateContainerInput) => void;
};

const defaultState: CreateContainerInput = {
  name: "",
  description: "",
  status: "Unfinished",
  medium: "",
  tags: []
};

export function ContainerForm({ onCreate }: ContainerFormProps) {
  const [form, setForm] = useState(defaultState);
  const [rawTags, setRawTags] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }
    onCreate({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      medium: form.medium.trim(),
      tags: normalizeTags(rawTags)
    });
    setForm(defaultState);
    setRawTags("");
  }

  return (
    <section className="card">
      <div className="section">
        <p className="eyebrow">New container</p>
        <h3 className="card-title">Start an artwork space</h3>
        <p className="helper">
          Give each piece one home for references, process notes, and finished work.
        </p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Container name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
        <textarea
          className="textarea"
          placeholder="What are you making? Capture intent, mood, or assignment context."
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
        />
        <div className="split">
          <input
            className="input"
            placeholder="Medium or type"
            value={form.medium}
            onChange={(event) =>
              setForm((current) => ({ ...current, medium: event.target.value }))
            }
          />
          <select
            className="select"
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as CreateContainerInput["status"]
              }))
            }
          >
            <option value="Unfinished">Unfinished</option>
            <option value="Finished">Finished</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <input
          className="input"
          placeholder="Tags separated by commas"
          value={rawTags}
          onChange={(event) => setRawTags(event.target.value)}
        />
        <button className="button" type="submit">
          Create container
        </button>
      </form>
    </section>
  );
}
