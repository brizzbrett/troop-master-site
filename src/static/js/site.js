// Small enhancements: the day/night slider, the screenshot lightbox, the signup form.

// Day/night compare: the range input moves where the night image starts.
for (const fig of document.querySelectorAll("[data-compare]")) {
  const range = fig.querySelector("[data-compare-range]");
  const frame = fig.querySelector(".compare-frame");
  const set = () => frame.style.setProperty("--x", range.value + "%");
  range.addEventListener("input", set);
  set();
}

// Lightbox: shows the clicked screenshot full width, with previous/next and Escape to close.
const box = document.querySelector("[data-lightbox]");
if (box) {
  const items = [...document.querySelectorAll("[data-gallery-item]")];
  const stage = box.querySelector("[data-lightbox-stage]");
  const caption = box.querySelector("[data-lightbox-caption]");
  let at = 0;
  const show = (i) => {
    at = (i + items.length) % items.length;
    const pic = items[at].querySelector("picture").cloneNode(true);
    pic.querySelectorAll("source, img").forEach((el) => el.setAttribute("sizes", "96vw"));
    const img = pic.querySelector("img");
    img.loading = "eager";
    stage.replaceChildren(pic);
    caption.textContent = img.alt;
  };
  items.forEach((btn, i) => btn.addEventListener("click", () => { show(i); box.showModal(); }));
  box.querySelector("[data-lightbox-prev]").addEventListener("click", () => show(at - 1));
  box.querySelector("[data-lightbox-next]").addEventListener("click", () => show(at + 1));
  box.querySelector("[data-lightbox-close]").addEventListener("click", () => box.close());
  box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });
}

// Signup: submit in the background and say what happened. If the request can't be made from the page,
// fall back to a normal form post (it opens Kit's own confirmation page in a new tab).
for (const form of document.querySelectorAll("[data-signup]")) {
  const status = form.querySelector("[data-signup-status]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status !== "failed") {
        form.reset();
        status.textContent = "You're on the list. Check your inbox to confirm.";
      } else {
        status.textContent = "That didn't go through. Check the address and try again.";
      }
    } catch {
      form.submit();
    } finally {
      button.disabled = false;
    }
  });
}
