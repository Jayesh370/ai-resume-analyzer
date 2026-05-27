import api from "./api.js";

export const resumeBuilderApi = {
  async templates() {
    const { data } = await api.get("/resume-builder/templates");
    return data.templates;
  },

  async list() {
    const { data } = await api.get("/resume-builder");
    return data.builds;
  },

  async get(id) {
    const { data } = await api.get(`/resume-builder/${id}`);
    return data.build;
  },

  async create(payload) {
    const { data } = await api.post("/resume-builder", payload);
    return data.build;
  },

  async update(id, payload) {
    const { data } = await api.put(`/resume-builder/${id}`, payload);
    return data.build;
  },

  async duplicate(id) {
    const { data } = await api.post(`/resume-builder/${id}/duplicate`);
    return data.build;
  },

  async tailor(id, payload) {
    const { data } = await api.post(`/resume-builder/${id}/tailor`, payload);
    return data.build;
  },

  async favorite(id, isFavorite) {
    await api.patch(`/resume-builder/${id}/favorite`, { isFavorite });
  },

  async remove(id) {
    await api.delete(`/resume-builder/${id}`);
  },

  async openPrintWindow(id) {
    const { data } = await api.get(`/resume-builder/${id}/export`, { responseType: "text" });
    const blob = new Blob([data], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank", "noopener,noreferrer");

    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      });
    }
  },
};
