import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


def open_page():
    # Configure Selenium to use Chrome
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # Uncomment if you want to run headlessly
    chrome_service = Service(ChromeDriverManager().install())

    # Start the WebDriver
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    # Navigate to the target URL
    url = 'https://www.gtleagues.com/past-results'
    driver.get(url)

    # Wait for the page to load fully
    time.sleep(5)  # Adjust as needed if the page loads slowly

    # Click the button to load all previous data with retries
    try:
        # Locate the "back" button
        back_button_xpath = '//button[contains(@class, "p-0") and contains(@class, "bg-transparent")]'
        displayed_date_xpath = '//div[contains(@class, "px-2") and contains(@class, "cursor-pointer")]'

        while True:
            try:
                # Locate and click the "back" button
                back_button = driver.find_element(By.XPATH, back_button_xpath)
                back_button.click()
                time.sleep(2)  # Adjust as necessary

                # Check the currently displayed date
                displayed_date_element = driver.find_element(By.XPATH, displayed_date_xpath)
                displayed_date = displayed_date_element.text.strip()

                # Stop when reaching January 1, 2024
                if displayed_date == "1 Jan 2024":
                    print("Reached January 1, 2024.")
                    break

            except Exception as click_error:
                # Retry finding and clicking if it fails
                print(f"Retrying due to error: {click_error}")
                time.sleep(2)  # Short pause before retrying

    except Exception as e:
        print(f"An error occurred while loading components: {e}")

    # Keep the browser open for inspection
    input("Press Enter to close the browser...")

    # Close the WebDriver
    driver.quit()


if __name__ == "__main__":
    open_page()