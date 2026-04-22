import axiosInstance from "./axiosInstance";

export async function getSurveys(params = { page: 0, size: 50 }) {
  const { data } = await axiosInstance.get("/admin/surveys", { params });
  return data.content || [];
}

export async function createSurvey(payload) {
  const { data } = await axiosInstance.post("/admin/surveys", payload);
  return data;
}

export async function getSurveyDetail(surveyId) {
  const { data } = await axiosInstance.get(`/admin/surveys/${surveyId}`);
  return data;
}

export async function getSurveyResults(surveyId) {
  const { data } = await axiosInstance.get(`/admin/surveys/${surveyId}/results`);
  return data;
}

export async function getSurveyDashboard(surveyId) {
  const { data } = await axiosInstance.get(
    `/admin/surveys/${surveyId}/dashboard`
  );
  return data;
}

export async function getPublicSurvey(publicKey) {
  const { data } = await axiosInstance.get(`/public/surveys/${publicKey}`);
  return data;
}

export async function submitPublicSurvey(publicKey, payload) {
  const { data } = await axiosInstance.post(
    `/public/surveys/${publicKey}/responses`,
    payload
  );
  return data;
}
