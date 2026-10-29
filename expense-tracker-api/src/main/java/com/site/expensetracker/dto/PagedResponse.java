package com.site.expensetracker.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean isLast;

        public static <T> PagedResponse<T> from(Page<T> page) {
                PagedResponse<T> response = new PagedResponse<>();
                response.setContent(page.getContent());
                response.setPage(page.getNumber());
                response.setSize(page.getSize());
                response.setTotalElements(page.getTotalElements());
                response.setTotalPages(page.getTotalPages());
                response.setLast(page.isLast());
                return response;
        }
}