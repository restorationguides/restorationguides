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

    let logData = [["Timestamp", "Temp (F)", "RH (%)", "GPP", "Dew Point (F)"]];

document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calculateGPP');
    const downloadBtn = document.getElementById('downloadLog');

    calcBtn.addEventListener('click', () => {
        const tempF = parseFloat(document.getElementById('temperature').value);
        const rh = parseFloat(document.getElementById('humidity').value);

        if (isNaN(tempF) || isNaN(rh) || rh < 0 || rh > 100) {
            alert("Invalid input. Temperature must be numeric and RH between 0-100.");
            return;
        }

        // Calculations
        const tempC = (tempF - 32) * 5 / 9;
        const Es = 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
        const Ea = Es * (rh / 100);
        
        const alpha = Math.log(rh / 100) + (17.67 * tempC) / (243.5 + tempC);
        const dpC = (243.5 * alpha) / (17.67 - alpha);
        const dpF = (dpC * 9 / 5) + 32;
        
        const gpp = 4354 * (Ea / (1013.25 - Ea));

        // Update UI
        document.getElementById('gpp').textContent = gpp.toFixed(2);
        document.getElementById('dewPoint').textContent = dpF.toFixed(1);
        document.getElementById('results').classList.remove('hidden');

        // Add to CSV Log array
        logData.push([new Date().toLocaleString(), tempF, rh, gpp.toFixed(2), dpF.toFixed(1)]);
    });

    downloadBtn.addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8," 
            + logData.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "restoration_hub_reading.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});