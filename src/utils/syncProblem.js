// Turns a failed send into words a person can act on.
// Returns { message, detail, status, needsLogin }.
//  - message: what is wrong, in plain words
//  - detail: what the server (or the phone) said exactly, to pass on to a developer
export function describeSyncError(error) {
  const status = error && error.status ? Number(error.status) : 0;
  const raw = String((error && error.message) || '').trim();

  if (status === 401 || status === 403) {
    return {
      message: 'Your login has expired, so the server will not accept new records.',
      detail: raw,
      status,
      needsLogin: true,
    };
  }

  if (status === 404) {
    return {
      message:
        'The server could not find the address for saving plants (error 404). If this app was installed before the server moved, it needs to be updated.',
      detail: raw,
      status,
      needsLogin: false,
    };
  }

  if (status >= 500) {
    return {
      message: `The server could not save the record (error ${status}).`,
      detail: raw,
      status,
      needsLogin: false,
    };
  }

  if (/photo upload failed/i.test(raw)) {
    return {
      message: 'A photo could not be uploaded, so the record was not sent.',
      detail: raw,
      status,
      needsLogin: false,
    };
  }

  const isNetwork =
    error instanceof TypeError ||
    (error && error.name === 'AbortError') ||
    /network request failed|failed to fetch|timed out|timeout/i.test(raw);

  if (isNetwork) {
    return {
      message: 'The server could not be reached. Check the internet connection.',
      detail: '',
      status: 0,
      needsLogin: false,
    };
  }

  return {
    message: 'The record could not be sent.',
    detail: raw,
    status,
    needsLogin: false,
  };
}
