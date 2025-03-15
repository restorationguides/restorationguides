document.addEventListener("DOMContentLoaded", function () {
    const secretButton = document.getElementById("reveal-secret");
    const secretText = document.getElementById("secret-contact");

    secretButton.addEventListener("click", function () {
        secretText.classList.toggle("hidden");
    });
});
