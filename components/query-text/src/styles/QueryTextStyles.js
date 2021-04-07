import { css } from 'lit-element';

export const queryTextStyles = css`

            :host {
                font-family: Arial, Helvetica, sans-serif;
            }
            
            .search-bar {
                width: 100%;
                text-align: center;
                border: 1px solid #00b4cc;
                margin: 0 auto;
                font-size: 1.4rem;
                border-radius: 5px;
                outline: none;
            }
            .search-bar:focus {
                border: solid 1px #707070;
                box-shadow: 0 0 5px 1px #00b4cc;
            }
            .search-results li {
                border: 1px solid var(--sl-color-gray-300);
                border-radius: 3px;
                font-size: 1.2rem;
                padding: 10px;
                background-color: #f9fafb;
            }
            .search-results {
                align-items: stretch;
                list-style-type: none;
                padding: 0;
                margin: 0 auto;
                width: 100%;
                position: absolute;
                z-index: 100;
            }
            .search-results li:hover {
                background: #34b399;
                cursor: pointer;
            }
            .search-results li:focus {
                background: #34b399;
            }
            .search-box {
                display: flex;
            }

            .search-results__container {
                position: relative;
            }
    }`;
