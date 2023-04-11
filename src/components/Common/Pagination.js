import React from 'react';
import classnames from 'classnames';
import { usePagination, DOTS } from './UsePagination';
// import './pagination.scss';
const Pagination = props => {
    const {
        onPageChange,
        totalCount,
        siblingCount = 1,
        currentPage,
        pageSize,
        className,
        productDetailed
    } = props;

    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize
    });

    // If there are less than 2 times in pagination range we shall not render the component
    if (currentPage === 0 || paginationRange[paginationRange.length - 1] < 2) {
        return null;
    }

    const onNext = () => {
        if(currentPage < paginationRange[paginationRange.length - 1]) {
            onPageChange(currentPage + 1);
        }
    };

    const onPrevious = () => {
        if(currentPage >= 2) {
            onPageChange(currentPage - 1);
        }
    };

    let lastPage = paginationRange[paginationRange.length - 1];
    return (
        <ul
            className={classnames('pagination-container pagination cus-new-pagination list-unstyled d-flex justify-content-between align-items-center w-100', { [className]: className })}
        >
            {/* Left navigation arrow */}
            <li className="page-item me-auto" onClick={onPrevious}>
                    <img src={`/media/images/${currentPage >= 2 ? "prev.png" : "prev-disabled.png"}`} className="img-fluid" />
            </li>

            {!productDetailed && paginationRange.map(pageNumber => {

                // If the pageItem is a DOT, render the DOTS unicode character
                if (pageNumber === DOTS) {
                    return <li className="pagination-item dots">&#8230;</li>;
                }

                // Render our Page Pills
                return (
                    <li className={`page-item px-1 ${currentPage === pageNumber && "active"}`} onClick={() => onPageChange(pageNumber)}>{pageNumber}</li>
                );
            })}

            {/*  Right Navigation arrow */}
            <li className="page-item ms-auto" onClick={onNext} disabled={true}>
                    <img src={`/media/images/${currentPage < paginationRange[paginationRange.length - 1] ? "next.png" : "next-disabled.png"}`} className="img-fluid" />
            </li>
        </ul>
    );
};

export default Pagination;