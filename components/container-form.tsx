"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { CreateContainerInput } from "@/lib/types";
import { normalizeTags, readFileAsDataUrl } from "@/lib/utils";

type ContainerFormProps = {
  onCreate: (input: CreateContainerInput) => void | Promise<void>;
};

const defaultState: CreateContainerInput = {
  name: "",
  description: "",
  status: "Unfinished",
  medium: "",
  tags: [],
  mainSketchTitle: "",
  mainSketchUrl: ""
};

export function ContainerForm({ onCreate }: ContainerFormProps) {
  const [form, setForm] = useState(defaultState);
  const [rawTags, setRawTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setForm((current) => ({
      ...current,
      mainSketchUrl: dataUrl,
      mainSketchTitle: current.mainSketchTitle || file.name.replace(/\.[^/.]+$/, "")
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.mainSketchUrl) {
      return;
    }
    setIsSubmitting(true);
    await onCreate({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      medium: form.medium.trim(),
      tags: normalizeTags(rawTags),
      mainSketchTitle: form.mainSketchTitle.trim() || `${form.name.trim()} Main Sketch`
    });
    setForm(defaultState);
    setRawTags("");
    setIsSubmitting(false);
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
        <div className="upload-zone form-grid">
          <div>
            <p className="section-title">Required main sketch</p>
            <p className="helper">
              Every container starts with one large primary sketch that anchors the corkboard.
            </p>
          </div>
          <input
            className="input"
            placeholder="Main sketch title"
            value={form.mainSketchTitle}
            onChange={(event) =>
              setForm((current) => ({ ...current, mainSketchTitle: event.target.value }))
            }
            required
          />
          <input type="file" accept="image/*" onChange={handleFileChange} required />
          <p className="helper tiny">
            Upload the sketch you want featured first. Notes and references can be added after the
            container opens.
          </p>
        </div>
        <button className="button" type="submit" disabled={isSubmitting || !form.mainSketchUrl}>
          {isSubmitting ? "Creating..." : "Create container"}
        </button>
      </form>
    </section>
  );
}
