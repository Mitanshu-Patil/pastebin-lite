function createPaste() {
  fetch("/api/pastes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: document.getElementById("content").value,
      ttl_seconds: document.getElementById("ttl").value
        ? Number(document.getElementById("ttl").value)
        : undefined,
      max_views: document.getElementById("views").value
        ? Number(document.getElementById("views").value)
        : undefined,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.url) {
        document.getElementById("result").innerText = "Error creating paste";
        return;
      }

      document.getElementById(
        "result"
      ).innerHTML = `<a href="${data.url}" target="_blank">${data.url}</a>`;
    })
    .catch(() => {
      document.getElementById("result").innerText = "Server error";
    });
}
