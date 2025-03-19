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
    let calculateBtn = document.getElementById("calculate");
    let dehuTypeSelect = document.getElementById("dehuType");
    let classFactorSelect = document.getElementById("classFactor");
    let dehuCapacityInput = document.getElementById("dehuCapacity");

    // Function to update Class Factor options
    function updateClassFactorOptions(dehuType) {
        classFactorSelect.innerHTML = ""; // Clear previous options

        if (dehuType === "1") { // Standard Dehumidifier
            addClassFactorOption("100", "Class 1 (100)");
            addClassFactorOption("50", "Class 2 (50)");
            addClassFactorOption("40", "Class 3 (40)");
            addClassFactorOption("30", "Class 4 (30)");
        } else if (dehuType === "1.5") { // LGR Dehumidifier
            addClassFactorOption("50", "Class 2 (50)");
            addClassFactorOption("40", "Class 3 (40)");
            addClassFactorOption("30", "Class 4 (30)");
        } else if (dehuType === "2") { // Desiccant
            addClassFactorOption("30", "Class 4 (30)");
        }

        classFactorSelect.disabled = false; // Unlock class factor selection
    }

    function addClassFactorOption(value, text) {
        let option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        classFactorSelect.appendChild(option);
    }

    // Handle Dehumidifier Type Selection
    dehuTypeSelect.addEventListener("change", function () {
        let dehuType = dehuTypeSelect.value;
        
        if (dehuType) {
            updateClassFactorOptions(dehuType);
        } else {
            classFactorSelect.disabled = true;
            classFactorSelect.innerHTML = `<option value="">Select Dehu Type First</option>`;
        }
    });

    calculateBtn.addEventListener("click", function () {
        let length = parseFloat(document.getElementById("length").value) || 0;
        let width = parseFloat(document.getElementById("width").value) || 0;
        let height = parseFloat(document.getElementById("height").value) || 0;
        let temperature = parseFloat(document.getElementById("temperature").value) || 0;
        let humidity = parseFloat(document.getElementById("humidity").value) || 0;
        let classFactor = parseFloat(classFactorSelect.value) || 0;
        let dehuType = parseFloat(dehuTypeSelect.value) || 0;
        let dehuCapacity = parseFloat(dehuCapacityInput.value) || 0;

        if (!length || !width || !height || !temperature || !humidity || !classFactor || !dehuType || !dehuCapacity) {
            alert("Please fill out all fields correctly.");
            return;
        }

        // Calculate Cubic Feet of the Room
        let cubicFeet = length * width * height;

        // Corrected Dew Point Calculation
        let dewPoint = temperature - ((100 - humidity) / 5);

        // Corrected GPP Calculation
        let gpp = (humidity / 100) * (temperature * 5);  

        // Corrected Airflow Needed (CFM)
        let airflow = (cubicFeet * 4) / 60;

        // Corrected AHAM Pints Needed
        let ahamPints = (cubicFeet * gpp) / (60 * classFactor);

        // Corrected Required Dehumidifiers
        let dehumidifiers = Math.ceil(ahamPints / dehuCapacity);

        // Display Results
        document.getElementById("dewPoint").textContent = dewPoint.toFixed(2);
        document.getElementById("gpp").textContent = gpp.toFixed(2);
        document.getElementById("airflow").textContent = airflow.toFixed(2);
        document.getElementById("ahamPints").textContent = ahamPints.toFixed(2);
        document.getElementById("dehumidifiers").textContent = dehumidifiers;

        document.getElementById("results").classList.remove("hidden");
        document.getElementById("results").classList.add("fade-in");
    });
});



