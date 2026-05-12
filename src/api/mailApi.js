import axiosInstance from "./axiosInstance";

export async function getMailConfig(surveyId) {
  const { data } = await axiosInstance.get(
    `/admin/surveys/${surveyId}/mail-config`
  );
  return data;
}

export async function saveMailConfig(surveyId, payload) {
  const { data } = await axiosInstance.put(
    `/admin/surveys/${surveyId}/mail-config`,
    payload
  );
  return data;
}

export async function getEmailLogs(surveyId) {
  const { data } = await axiosInstance.get(
    `/admin/surveys/${surveyId}/emails`
  );
  return data;
}

export async function getEmailLogsPage(
  surveyId,
  { page = 0, size = 20, status = "", emailType = "" } = {}
) {
  const { data } = await axiosInstance.get(
    `/admin/surveys/${surveyId}/emails/page`,
    {
      params: {
        page,
        size,
        ...(status ? { status } : {}),
        ...(emailType ? { emailType } : {}),
      },
    }
  );
  return data;
}

export async function getPendingEmails() {
  const { data } = await axiosInstance.get("/admin/emails/pending");
  return data;
}

export async function getPendingEmailsPage({ page = 0, size = 20 } = {}) {
  const { data } = await axiosInstance.get("/admin/emails/pending/page", {
    params: {
      page,
      size,
    },
  });
  return data;
}

export async function sendPendingEmails() {
  const { data } = await axiosInstance.post("/admin/emails/pending/send", {});
  return data;
}

export async function retryFailedEmail(emailLogId) {
  const { data } = await axiosInstance.post(
    `/admin/emails/${emailLogId}/retry`,
    {}
  );
  return data;
}

export async function importRespondents(surveyId, emails) {
  const { data } = await axiosInstance.post(
    `/admin/surveys/${surveyId}/respondents/import`,
    { emails }
  );
  return data;
}

export async function previewRespondentImport(surveyId, emails) {
  const { data } = await axiosInstance.post(
    `/admin/surveys/${surveyId}/respondents/import-preview`,
    { emails }
  );
  return data;
}

export async function queueInvitations(surveyId) {
  const { data } = await axiosInstance.post(
    `/admin/surveys/${surveyId}/invitations/queue`,
    {}
  );
  return data;
}

export async function getRespondents(surveyId) {
  const { data } = await axiosInstance.get(
    `/admin/surveys/${surveyId}/respondents`
  );
  return data;
}

export async function getRespondentsPage(
  surveyId,
  { page = 0, size = 20, status = "ALL" } = {}
) {
  const { data } = await axiosInstance.get(
    `/admin/surveys/${surveyId}/respondents/page`,
    {
      params: {
        page,
        size,
        status,
      },
    }
  );
  return data;
}

export async function getReminderCandidates(surveyId) {
  const { data } = await axiosInstance.get(
    `/admin/surveys/${surveyId}/reminders/candidates`
  );
  return data;
}

export async function getReminderCandidatesPage(
  surveyId,
  { page = 0, size = 20 } = {}
) {
  const { data } = await axiosInstance.get(
    `/admin/surveys/${surveyId}/reminders/candidates/page`,
    {
      params: {
        page,
        size,
      },
    }
  );
  return data;
}

export async function queueReminderEmails(surveyId) {
  const { data } = await axiosInstance.post(
    `/admin/surveys/${surveyId}/reminders/queue`,
    {}
  );
  return data;
}

export async function queueWeeklyReport(surveyId) {
  const { data } = await axiosInstance.post(
    `/admin/surveys/${surveyId}/weekly-report/queue`,
    {}
  );
  return data;
}
