window.onload = () => {

  let api: string = "http://localhost:2050/";
  let isFunctionRunning = false;
  console.log(isFunctionRunning);
  


  // This function  will handle retrieving the records from the api
  async function getRecords(fromID: number, toID: number): Promise<Array<Array<string>>> {
    try {
      const data = await fetch(`${api}records?from=${fromID}&to=${toID}`);
      const records: Array<Array<string>> = await data.json();
      console.log(fromID, toID);
      return records;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // This function  will handle retrieving the columns from the api
  async function getColumns(): Promise<Array<string>> {
    try {
      const data = await fetch(`${api}columns`);
      const columns: Array<string> = await data.json();
      return columns;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // This function  will handle retrieving the record count from the api
  async function getRecordCount(): Promise<number> {
    try {
      const data = await fetch(`${api}recordCount`);
      const count: number = await data.json();
      return count;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
 
  // This function will loop through and display the appropriate columns in the correct order.
  async function showColumns(): Promise<void> {
    try {
      $(".head-row").empty();
      let columns = await getColumns();
      for (let i = 0; i < columns.length; i++) {
        $("thead").append(`<th>${columns[i]}</th>`);
      }

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  showColumns();

  // This function will loop through and display the records on the table.
  async function showRecords(fromID: number, toID: number): Promise<void> {
    console.log(isFunctionRunning);
    
    if (isFunctionRunning) {
      return;
    }
    isFunctionRunning = true;
    try {
      $("tbody").empty();
      let records = await getRecords(fromID, toID);
      $('.results').empty().append(`Displaying ID's ${fromID} - ${toID}`)
      for (let i = 0; i < records.length; i++) {
        $("tbody").append(`<tr class="body-row">`);
        for (let n = 0; n < records[i].length; n++) {
          $(".body-row:last-child").append(`<td><span>${records[i][n]}</span></td>`);
        }
        $("tbody").append(`</tr>`);
      }
      
      let inputNumber: string = $('.search-input').val() as string
      $("span").each(function () {
        const lowercasedID: string = $(this).text() as string; 
        if (lowercasedID == inputNumber) {
          $(this).css({ "background-color": "#FFFF00", "color": "black" });
        } else {
          $(this).css({ "background-color": "initial", "color": "#A1AFC2  " });
        }
      });
      
    } catch (error) {
      console.error(error);
      throw error;
    }
    isFunctionRunning = false;
  }
  showRecords(1, 20);

  // The following function handles all the functionality of the pagination and the pages. Including what records should be shown in the table.
  async function pageNumbers(start: number, end: number): Promise<void> {
    try {
      let count: number = await getRecordCount();
      let stringCount = count.toLocaleString().replace(/,/g, " ");
      $(".pagination").append(`<a class="prev">&laquo;</a>`);
      for (let i = start; i <= end; i++) {
        console.log(start, end);
        $(".pagination").append(
          `<a id="${i}" class="pagination-item">${i}</a>`
        );
      }
      $(".pagination").append(`<a class="next">&raquo;</a>`);

      // Adding a click event on the  pagination pages to display the appropriate number of records for that specific page number.

      $(".pagination-item").on("click", async function dynamicPagination(): Promise<Array<number>>{
        let maxRecords: number = await adjustDisplayedRecords() 
        let pageNumber: any = $(this).attr("id");
        let toID = parseInt(pageNumber) * maxRecords;
        let fromID: number = toID - (maxRecords - 1);
        $(".pagination-item").removeClass("active");
        $(this).addClass("active");
        showRecords(fromID, toID);
        $(".results").empty();
        $(".results").append(
          `Displaying ID's ${fromID} - ${toID} out of ${stringCount}`
        );
        return [fromID, toID]
      });

      // Adding a click event to the next button of the pagination.
      $(".next").on("click", async function () {
        if (isFunctionRunning) {
          return;
        }
        isFunctionRunning = true
          start = start + 20;
          end = end + 20;
          $(".pagination").empty();
          await pageNumbers(start, end);
      });
      isFunctionRunning = false

      // Adding a if statement in the case that pagination start with the page number 1. In the else statement a click event is added for the next button of the pagination.
      if(isFunctionRunning) {
        return;
      }
      isFunctionRunning = true
      if (start == 1) {
        $(".prev").css({ display: "none" });
      } else {
        $(".prev").on("click", function () {
          $(".pagination").fadeOut("fast", function () {
            start = start - 20;
            end = end - 20;
            $(".pagination").empty();
            pageNumbers(start, end);
            $(".pagination").fadeIn("fast");
          });
        });
      }
      isFunctionRunning = false

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  pageNumbers(1, 20);

  async function resultsRange(event: any) {
    if (isFunctionRunning) {
      return;
    }
    isFunctionRunning = true;
    event.preventDefault();
    let inputNumber: string = $('.search-input').val() as string
    let inputNumberInt = parseInt(inputNumber);
    if(inputNumber !== '') {
      let end:number = Math.ceil(inputNumberInt / 20) * 20;
      let start: number = end - 19;
      if(inputNumberInt < 1000000) {
        if(end === 1000000){
          end = end - 1;
        } else null
        $('.results-box').remove()
        $('.search-container').append(`
                                      <div class="results-box">
                                        <p class="results-select">${start} - ${end}</p>
                                      </div>
                                      `)
        $('.results-box').on('click', resultsSelect)

        // Loop through all <span> elements after appending them to the search container
      $("span").each(function () {
        const lowercasedID: string = $(this).text() as string; 
        if (lowercasedID == inputNumber) {
          $(this).css({ "background-colovoidr": "#FFFF00", "color": "black" });
        } else {
          $(this).css({ "background-color": "initial", "color": "#A1AFC2  " });
        }
      });

        } else {
          $('.results-box').remove()
        }
      } else {
        $('.results-box').remove()
      }
      isFunctionRunning = false;
    }
  // Attach click event to the search button using jQuery
  
  async function resultsSelect() {
    if (isFunctionRunning) {
      return;
    }
    isFunctionRunning = true;
    let idRange = $('.results-select').text();
    let rangeArray = null
    rangeArray = idRange.split('-');
    $('.results-box').remove()
    let start = parseInt(rangeArray[0])
    let end = parseInt(rangeArray[1])
    isFunctionRunning = false;
    await showRecords(start, end)
  }
  
  $(".search-input").on("keyup", resultsRange);

  async function adjustDisplayedRecords(): Promise<number> {
    const screenHeight = $(window).height();
    const maxRecords = Math.floor(screenHeight / 45);
    $('tbody').empty()
    console.log( maxRecords);
    
    await showRecords(1, maxRecords) 
    return maxRecords
  } 
  
  $(window).on('resize', adjustDisplayedRecords);
  // $(document).ready(adjustDisplayedRecords);

};

 