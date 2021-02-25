import { css } from 'lit-element';

export const queryTextStyles = css`
            :host {
                grid-column: 4/10;
                margin: 100px 0;
            }
            .search-bar {
                width: 100%;
                text-align: center;
                height: 50px;
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
                border: 1px solid #00b4cc;
                font-size: 1.2rem;
                padding: 10px;
            }
            .search-results {
                align-items: stretch;
                list-style-type: none;
                padding: 0;
                margin: 0 auto;
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
    }`;
