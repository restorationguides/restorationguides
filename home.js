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
