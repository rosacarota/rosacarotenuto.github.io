const MY_NAMES = new Set([
  "R. Carotenuto",
  "Rosa Carotenuto",
]);


/* =====================================================
   Utilities
   ===================================================== */

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(
      `Could not load ${path}: ${response.status}`
    );
  }

  return response.json();
}


function getSitePeriod(period) {
  if (!period) {
    return "";
  }

  if (typeof period === "string") {
    return period.replaceAll("--", "—");
  }

  if (period.site) {
    return period.site;
  }

  if (period.latex) {
    return period.latex.replaceAll("--", "—");
  }

  return "";
}


function createDescriptionParagraph(
  label,
  value,
  options = {}
) {
  const {
    italic = false,
    extraClass = "",
  } = options;

  const paragraph = document.createElement("p");

  paragraph.className = [
    "education-description",
    extraClass,
  ]
    .filter(Boolean)
    .join(" ");

  const strong = document.createElement("strong");
  strong.textContent = `${label}: `;

  paragraph.appendChild(strong);

  if (italic) {
    const emphasis = document.createElement("em");
    emphasis.textContent = value;
    paragraph.appendChild(emphasis);
  } else {
    paragraph.appendChild(
      document.createTextNode(value)
    );
  }

  return paragraph;
}


/* =====================================================
   Education
   ===================================================== */

function renderEducation(items) {
  const timeline = document.getElementById(
    "education-timeline"
  );

  if (!timeline) {
    return;
  }

  timeline.replaceChildren();

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "education-item";

    const marker = document.createElement("div");
    marker.className = "education-marker";

    const content = document.createElement("div");
    content.className = "education-content";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const date = document.createElement("span");
    date.className = "education-date";
    date.textContent = getSitePeriod(item.period);

    const institution = document.createElement("p");
    institution.className =
      "education-institution";

    let institutionName = item.institution;

    if (item.institutionShort) {
      institutionName +=
        ` (${item.institutionShort})`;
    }

    institution.textContent = item.location
      ? `${institutionName} · ${item.location}`
      : institutionName;

    content.append(
      title,
      date,
      institution
    );

    if (item.description) {
      const description =
        document.createElement("p");

      description.className =
        "education-description";

      description.textContent =
        item.description;

      content.appendChild(description);
    }

    if (item.curriculum) {
      content.appendChild(
        createDescriptionParagraph(
          "Curriculum",
          item.curriculum
        )
      );
    }

    if (item.grade) {
      let grade = item.grade;

      if (item.distinction) {
        grade += `, ${item.distinction}`;
      }

      content.appendChild(
        createDescriptionParagraph(
          "Final grade",
          grade
        )
      );
    }

    if (item.thesis) {
      content.appendChild(
        createDescriptionParagraph(
          "Thesis",
          item.thesis,
          {
            italic: true,
            extraClass: "education-thesis",
          }
        )
      );
    }

    const advisors = item.advisors ?? [];
    const supervisors =
      item.supervisors ?? [];

    if (advisors.length > 0) {
      const label =
        advisors.length === 1
          ? "Advisor"
          : "Advisors";

      content.appendChild(
        createDescriptionParagraph(
          label,
          advisors.join(", ")
        )
      );
    } else if (supervisors.length > 0) {
      const label =
        supervisors.length === 1
          ? "Supervisor"
          : "Supervisors";

      content.appendChild(
        createDescriptionParagraph(
          label,
          supervisors.join(", ")
        )
      );
    }

    article.append(
      marker,
      content
    );

    timeline.appendChild(article);
  });
}


/* =====================================================
   Publications
   ===================================================== */

function createAuthors(authors) {
  const paragraph =
    document.createElement("p");

  paragraph.className =
    "publication-authors";

  authors.forEach((author, index) => {
    if (index > 0) {
      paragraph.appendChild(
        document.createTextNode(", ")
      );
    }

    if (MY_NAMES.has(author)) {
      const strong =
        document.createElement("strong");

      strong.textContent = author;

      paragraph.appendChild(strong);
    } else {
      paragraph.appendChild(
        document.createTextNode(author)
      );
    }
  });

  return paragraph;
}


function getPublicationLink(publication) {
  const links = publication.links ?? {};

  if (links.paper) {
    return links.paper;
  }

  if (links.doi) {
    if (
      links.doi.startsWith("http://") ||
      links.doi.startsWith("https://")
    ) {
      return links.doi;
    }

    return `https://doi.org/${links.doi}`;
  }

  return null;
}


function renderPublications(items) {
  const list = document.getElementById(
    "publications-list"
  );

  if (!list) {
    return;
  }

  list.replaceChildren();

  const featured = items
    .filter(
      (publication) =>
        publication.featured === true
    )
    .sort(
      (a, b) =>
        (b.year ?? 0) - (a.year ?? 0)
    );

  featured.forEach((publication) => {
    const article =
      document.createElement("article");

    article.className = "publication";

    const top =
      document.createElement("div");

    top.className = "publication-top";

    const meta =
      document.createElement("div");

    meta.className = "publication-meta";


    // Publication code: C01, J01, ...
    const code =
      document.createElement("span");

    code.className = "publication-code";
    code.textContent =
      publication.code ?? "";


    const venue =
      document.createElement("span");

    venue.className =
      "publication-venue";

    venue.textContent =
      publication.venue?.shortName ||
      publication.venue?.name ||
      "";


    const year =
      document.createElement("span");

    year.className =
      "publication-year";

    year.textContent =
      publication.year ?? "";


    meta.append(
      code,
      venue,
      year
    );

    top.appendChild(meta);


    const link =
      getPublicationLink(publication);

    if (link) {
      const anchor =
        document.createElement("a");

      anchor.className =
        "publication-link";

      anchor.href = link;
      anchor.target = "_blank";
      anchor.rel =
        "noopener noreferrer";

      anchor.textContent =
        "Open paper →";

      top.appendChild(anchor);
    }


    const title =
      document.createElement("h3");

    title.textContent =
      publication.title;


    const authors =
      createAuthors(
        publication.authors ?? []
      );


    article.append(
      top,
      title,
      authors
    );

    list.appendChild(article);
  });
}

/* =====================================================
   Scroll reveal
   ===================================================== */

function initScrollReveal() {
  const sections = document.querySelectorAll(
    "main > section:not(.intro-section)"
  );

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle(
          "is-visible",
          entry.isIntersecting
        );
      });
    },
    {
      threshold: 0.18,
      rootMargin: "-5% 0px -5% 0px",
    }
  );

  sections.forEach((section) => {
    section.classList.add("reveal-section");
    observer.observe(section);
  });
}

/* =====================================================
   Initialization
   ===================================================== */

async function initAcademicData() {
  try {
    const [
      educationData,
      publicationsData,
    ] = await Promise.all([
      loadJson("data/education.json"),
      loadJson("data/publications.json"),
    ]);

    renderEducation(
      educationData.education ?? []
    );

    renderPublications(
      publicationsData.publications ?? []
    );
  } catch (error) {
    console.error(
      "Could not load academic data:",
      error
    );
  }
}


initAcademicData();
initScrollReveal();