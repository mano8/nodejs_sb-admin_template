

window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const datatablesSimple = document.getElementById('tableSelec');
    if (datatablesSimple) {
        const datatable = new simpleDatatables.DataTable(datatablesSimple, {
            perPageSelect: [5, 10, 15, 20, 25, 50, 100],
            perPage: 25
        });
    }
});
