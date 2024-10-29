import time
import re
import pandas as pd
import threading
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager

# Global flag to stop the extraction process
stop_extraction = False


def save_data_to_csv(data, filename='past_results_data.csv'):
    """Save the extracted data to a CSV file."""
    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)
    print(f"Data saved to {filename}")


def keypress_listener():
    global stop_extraction
    input("Press any key to stop the extraction...")
    stop_extraction = True


def open_page():
    global stop_extraction
    # Configure Selenium to use Chrome
    chrome_options = Options()
    #chrome_options.add_argument("--headless")  # Uncomment if you want to run headlessly
    chrome_service = Service(ChromeDriverManager().install())

    # Start the WebDriver
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    # Navigate to the target URL
    url = 'https://www.gtleagues.com/past-results'
    driver.get(url)

    # Wait for the page to load fully
    time.sleep(7)  # Adjust as needed

    all_data = []

    try:
        # XPath definitions
        back_button_xpath = '//button[contains(@class, "p-0") and contains(@class, "bg-transparent")]'
        displayed_date_xpath = '//h6[contains(@class, "MuiTypography-h6") and contains(text(), "Past Results:")]'
        next_page_button_xpath = '//span[text()="chevron_right"]/ancestor::button'
        pagination_info_xpath = '//span[contains(@class, "MuiTypography-caption")]'
        table_row_xpath = '//tbody[@class="MuiTableBody-root"]/tr'

        while not stop_extraction:
            # Retrieve the currently displayed date
            displayed_date_element = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, displayed_date_xpath))
            )
            displayed_date_text = displayed_date_element.text.replace("Past Results:", "").strip()
            print(f"Currently displayed date: {displayed_date_text}")

            # Stop if the date is January 1, 2022
            if displayed_date_text == "01 Jan 2024":
                print("Reached January 1, 2022. Stopping navigation.")
                break

            # Extract data for all pages in the current date
            current_page = 1
            while not stop_extraction:
                # Scroll to top to avoid hidden elements
                driver.execute_script("window.scrollTo(0, 0);")

                # Get total pages from pagination info
                pagination_info = driver.find_element(By.XPATH, pagination_info_xpath).text
                total_items_match = re.search(r'of (\d+)', pagination_info)
                if total_items_match:
                    total_items = int(total_items_match.group(1))
                    items_per_page = 50  # Adjust if items per page differ
                    total_pages = (total_items // items_per_page) + (1 if total_items % items_per_page != 0 else 0)

                # Extract data from current page's table rows
                print(f"Extracting data from page {current_page} for date {displayed_date_text}...")
                rows = driver.find_elements(By.XPATH, table_row_xpath)
                for row in rows:
                    cells = row.find_elements(By.TAG_NAME, 'td')
                    if len(cells) >= 7:
                        row_data = {
                            "Date": displayed_date_text,
                            "ID": cells[0].text,
                            "Game": cells[1].text,
                            "Level": cells[2].text,
                            "Date/Time": cells[3].text,
                            "Home Team": cells[4].text,
                            "Home Player": cells[4].find_element(By.TAG_NAME, "strong").text if cells[4].find_elements(By.TAG_NAME, "strong") else "",
                            "Away Team": cells[5].text,
                            "Away Player": cells[5].find_element(By.TAG_NAME, "strong").text if cells[5].find_elements(By.TAG_NAME, "strong") else "",
                            "Home Score": cells[6].find_element(By.TAG_NAME, "input").get_attribute("value"),
                            "Away Score": cells[7].find_element(By.TAG_NAME, "input").get_attribute("value"),
                            "Status": cells[9].text
                        }
                        all_data.append(row_data)

                # Move to the next page if it exists, otherwise break
                if current_page < total_pages:
                    next_page_button = WebDriverWait(driver, 10).until(
                        EC.element_to_be_clickable((By.XPATH, next_page_button_xpath))
                    )
                    next_page_button.click()
                    time.sleep(5)
                    current_page += 1
                else:
                    break  # Exit loop when no more pages are available for the date

            # Move to previous date by clicking the back button
            if not stop_extraction:
                try:
                    back_button = WebDriverWait(driver, 10).until(
                        EC.element_to_be_clickable((By.XPATH, back_button_xpath))
                    )
                    back_button.click()
                    time.sleep(2)  # Adjust as necessary
                except Exception as click_error:
                    print(f"Retrying due to error: {click_error}")
                    time.sleep(2)  # Short pause before retrying

    except (TimeoutException, WebDriverException) as e:
        print(f"Network or driver error encountered: {e}")
        print("Saving data collected so far and exiting...")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        print("Saving data collected so far and exiting...")

    finally:
        # Save the collected data to CSV, regardless of success or interruption
        save_data_to_csv(all_data)

        # Close the WebDriver
        driver.quit()


if __name__ == "__main__":
    # Start the keypress listener thread
    listener_thread = threading.Thread(target=keypress_listener)
    listener_thread.start()

    # Run the main extraction function
    open_page()

    # Wait for listener thread to complete
    listener_thread.join()
    print("Extraction process terminated.")
