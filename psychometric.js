document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("psychrometricCanvas");
    const ctx = canvas.getContext("2d");

    // Define chart properties
    const tempMin = 50;
    const tempMax = 120;
    const gppMin = 0;
    const gppMax = 2500;
    const rhLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    function resizeCanvas() {
        canvas.width = Math.min(window.innerWidth * 0.9, 900);
        canvas.height = 500;
        drawChart();
    }

    window.addEventListener("resize", resizeCanvas);
    setTimeout(resizeCanvas, 100);

    function tempToX(temp) {
        return ((temp - tempMin) / (tempMax - tempMin)) * canvas.width;
    }

    function gppToY(gpp) {
        return canvas.height - ((gpp - gppMin) / (gppMax - gppMin)) * canvas.height;
    }

    function grainsPerPound(temp, rh) {
        return (rh / 100) * (0.62198 * (Math.exp((17.27 * temp) / (temp + 237.3)) / 101.325) * 7000);
    }

    function drawChart() {
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;
        for (let i = tempMin; i <= tempMax; i += 10) {
            let x = tempToX(i);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            ctx.fillText(`${i}°F`, x - 10, canvas.height - 5);
        }
        for (let j = gppMin; j <= gppMax; j += 500) {
            let y = gppToY(j);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
            ctx.fillText(`${j} GPP`, 5, y - 5);
        }

        rhLevels.forEach(rh => {
            ctx.beginPath();
            ctx.strokeStyle = `hsl(${rh * 3}, 100%, 50%)`;
            ctx.lineWidth = 2;

            for (let temp = tempMin; temp <= tempMax; temp += 1) {
                let gpp = grainsPerPound(temp, rh);
                let x = tempToX(temp);
                let y = gppToY(gpp);

                if (temp === tempMin) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        });

        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        ctx.fillText("Dry Bulb Temperature (°F)", canvas.width / 2 - 50, canvas.height - 10);
        ctx.fillText("Grains Per Pound (GPP)", 10, 20);
    }

    canvas.addEventListener("mousemove", function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const temp = tempMin + ((mouseX / canvas.width) * (tempMax - tempMin));
        const gpp = gppMin + ((1 - (mouseY / canvas.height)) * (gppMax - gppMin));

        document.getElementById("hoverInfo").innerText = `Temp: ${temp.toFixed(1)}°F, GPP: ${Math.round(gpp)} grains`;
    });

    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const temp = tempMin + ((clickX / canvas.width) * (tempMax - tempMin));
        const gpp = gppMin + ((1 - (clickY / canvas.height)) * (gppMax - gppMin));

        document.getElementById("selectedInfo").innerHTML = `<strong>Selected Temp:</strong> ${temp.toFixed(1)}°F, <strong>GPP:</strong> ${Math.round(gpp)} grains`;
    });
});
