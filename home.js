document.addEventListener("DOMContentLoaded", function () {
    const newsContainer = document.getElementById("news-container");

    async function fetchIndustryNews() {
        const feeds = [
            "https://www.randrmagonline.com/rss/articles",
            "https://www.cleanfax.com/feed/",
            "https://iicrc.org/news_rss.asp"
        ];

        newsContainer.innerHTML = "<p>Loading news...</p>";

        try {
            let allNews = [];

            for (let feed of feeds) {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed)}`);
                const data = await response.json();

                const parser = new DOMParser();
                const xml = parser.parseFromString(data.contents, "text/xml");

                const items = xml.querySelectorAll("item");
                items.forEach(item => {
                    const title = item.querySelector("title").textContent;
                    const link = item.querySelector("link").textContent;
                    const description = item.querySelector("description")?.textContent || "No description available.";

                    allNews.push({ title, link, description });
                });
            }

            // Limit to 5 latest articles
            newsContainer.innerHTML = "";
            allNews.slice(0, 5).forEach(article => {
                const newsItem = document.createElement("div");
                newsItem.classList.add("news-item");

                newsItem.innerHTML = `
                    <h3>${article.title}</h3>
                    <p>${article.description}</p>
                    <a href="${article.link}" target="_blank">Read More</a>
                `;

                newsContainer.appendChild(newsItem);
            });

        } catch (error) {
            console.error("Error fetching news:", error);
            newsContainer.innerHTML = "<p>Failed to load news. Try again later.</p>";
        }
    }

    fetchIndustryNews();
});

    document.addEventListener("DOMContentLoaded", function () {
        const calculateBtn = document.getElementById("calculateGPP");


      calculateBtn.addEventListener("click", function () {
        const temperature = parseFloat(document.getElementById("temperature").value);
        const humidity = parseFloat(document.getElementById("humidity").value);

        if (isNaN(temperature) || isNaN(humidity)) {
          alert("Please enter valid values.");
          return;
        }

        const atmosphericPressure = 29.92;
        const A = 6.116441, m = 7.591386, Tn = 240.7263;
        const tempC = (temperature - 32) * 5 / 9;
        const es = A * Math.pow(10, (m * tempC) / (tempC + Tn));
        const e = (humidity / 100) * es;
        const vaporPressure = e * 0.02953;
        const gpp = (7000 * 0.622 * vaporPressure) / (atmosphericPressure - vaporPressure);

        const lnRH = Math.log(humidity / 100);
        const alpha = ((m * tempC) / (Tn + tempC)) + lnRH;
        const dewPointC = (Tn * alpha) / (m - alpha);
        const dewPointF = (dewPointC * 9 / 5) + 32;

        document.getElementById("dewPoint").textContent = dewPointF.toFixed(2);
        document.getElementById("gpp").textContent = gpp.toFixed(2);
        document.getElementById("vaporPressure").textContent = vaporPressure.toFixed(4);
        document.getElementById("results").classList.remove("hidden");
      });
    });



