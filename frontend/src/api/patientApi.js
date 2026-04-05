import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

export const addPatient = async (data) => {
  const res = await API.post("/addPatient", data);
  return res.data;
};

export const updatePatient = (id, payload) => {
  const res = API.put(`/updatePatient/${id}`, payload);
  return res.data;
};

export const getCompanies = async () => {
  const res = await API.get("/companies");
  return res.data;
};

export const createCompany = async (data) => {
  const res = await API.post("/createCompany", data);
  return res.data;
};

export const getPatients = async (params) => {
  const res = await API.get("/getPatient", { params });
  return res.data;
};

export const deletePatient = async (id) => {
  const res = await API.delete(`/delete/${id}`);
  return res.data;
};
