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
    const calculateButton = document.getElementById("calculate");
    const resultsDiv = document.getElementById("results");

    calculateButton.addEventListener("click", function () {
        const tempF = parseFloat(document.getElementById("temperature").value);
        const rh = parseFloat(document.getElementById("humidity").value);

        if (isNaN(tempF) || isNaN(rh) || tempF <= 0 || rh <= 0 || rh > 100) {
            alert("Please enter valid values for temperature and humidity.");
            return;
        }

        // Calculate Dew Point (Simplified Approximation)
        const dewPoint = tempF - ((100 - rh) / 5);

        // Calculate Grains Per Pound (GPP)
        const saturationVP = 0.6108 * Math.exp((17.27 * tempF) / (tempF + 237.3));
        const actualVP = (rh / 100) * saturationVP;
        const gpp = actualVP * 7000; // Approximate formula for GPP

        // Calculate Vapor Pressure (in inches of Mercury)
        const vaporPressure = actualVP * 0.02953;

        // Display results
        document.getElementById("dewPoint").textContent = dewPoint.toFixed(2);
        document.getElementById("gpp").textContent = gpp.toFixed(2);
        document.getElementById("vaporPressure").textContent = vaporPressure.toFixed(4);

        resultsDiv.classList.remove("hidden");
    });
});

