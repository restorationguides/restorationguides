document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    // Set default active tab
    tabContents.forEach((tab) => {
        tab.style.display = "none";
    });
    document.getElementById("wrt").style.display = "block";

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedTab = button.getAttribute("data-tab");

            // Hide all tab content
            tabContents.forEach((content) => {
                content.style.display = "none";
                content.classList.remove("active");
            });

            // Remove active class from all buttons
            tabButtons.forEach((btn) => {
                btn.classList.remove("active");
            });

            // Show selected tab and mark button as active
            document.getElementById(selectedTab).style.display = "block";
            document.getElementById(selectedTab).classList.add("active");
            button.classList.add("active");
        });
    });
});
